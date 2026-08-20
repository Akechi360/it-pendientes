import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, X, Loader2, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { createDocument, logActivity, sendOneSignalPush } from '../../services/supabaseService';
import { useRealtimeQuery } from '../../hooks/useRealtimeQuery';
import { GoogleGenAI } from '@google/genai';

interface VoiceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAgentModal: React.FC<VoiceAgentModalProps> = ({ isOpen, onClose }) => {
  const { toast, setActiveTab } = useApp();
  const { currentUser } = useAuth();

  // Suscribirse a usuarios reales registrados en el portal
  const { data: users = [] } = useRealtimeQuery<{ uid: string; displayName: string; role: string; title?: string }>('users');

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        setInputText(currentTranscript);
      };

      recognition.onerror = (err: any) => {
        console.warn('[WebSpeech] Error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, []);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (!speechSupported) {
      toast('El reconocimiento de voz nativo no está disponible en este navegador. Puedes escribir la instrucción en texto.', 'warning');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setInputText('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('[WebSpeech] Start error:', err);
      }
    }
  };

  const cleanText = (raw: string): string => {
    return raw
      .replace(/^(registra|registrame|crea|creame|agrega|agregame|nueva|nuevo)\s+(una|un)?\s*(incidencia|tarea|reunion|reunión|proyecto)?\s*(para|sobre|con)?\s*/i, '')
      .replace(/(\s*y?\s*asígna(sela|la|lo)?\s*(de\s+manera\s+\w+)?\s*a\s+[\w\s]+)$/i, '')
      .trim();
  };

  const handleProcessCommand = async (command: string) => {
    if (!command.trim() || !currentUser) return;
    setIsProcessing(true);

    try {
      let parsedIntent: any = null;

      // Generar lista de miembros del equipo formateada para Gemini
      const membersText = users.map(u => `- ${u.displayName} (UID: ${u.uid})`).join('\n');

      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `Eres un asistente inteligente para un Portal IT. Analiza este comando dictado por voz en español: "${command}".

Miembros del equipo disponibles para asignar:
${membersText}

Identifica el tipo y extrae datos en formato JSON estrictamente:
{
  "entityType": "task" | "incident" | "meeting" | "project",
  "title": "Título sintético y profesional del problema o tarea (ej: Falla de Wi-Fi y Portal Cautivo). Elimina comandos como 'registra una incidencia...'",
  "description": "Descripción clara del problema técnico omitiendo las instrucciones de asignación.",
  "priority": "baja" | "media" | "alta" | "critica",
  "category": "soporte" | "hardware" | "redes" | "sistemas" | "seguridad" | "mantenimiento",
  "assigneeUid": "UID exacto de la persona mencionada (ej: si mencionan a Eduardo, usa su UID). Si no mencionan a nadie, usa null",
  "assigneeName": "Nombre completo de la persona asignada o null"
}`
          });
          const text = response.text || '';
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedIntent = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.warn('[VoiceAgent] Fallback a motor de reglas local:', e);
        }
      }

      // Motor de Reglas Local (Fallback ultra-resistente)
      if (!parsedIntent) {
        const lower = command.toLowerCase();

        // 1. Tipo
        let entityType = 'task';
        if (lower.includes('incidencia') || lower.includes('falla') || lower.includes('error') || lower.includes('roto') || lower.includes('problema')) {
          entityType = 'incident';
        } else if (lower.includes('reunión') || lower.includes('reunion') || lower.includes('cita')) {
          entityType = 'meeting';
        } else if (lower.includes('proyecto')) {
          entityType = 'project';
        }

        // 2. Prioridad
        let priority = 'media';
        if (lower.includes('urgente') || lower.includes('crítica') || lower.includes('critica')) {
          priority = 'critica';
        } else if (lower.includes('alta')) {
          priority = 'alta';
        } else if (lower.includes('baja')) {
          priority = 'baja';
        }

        // 3. Asignación inteligente por coincidencia de nombre
        let matchedUser = currentUser;
        for (const u of users) {
          const firstName = u.displayName.split(' ')[0].toLowerCase();
          if (lower.includes(firstName)) {
            matchedUser = u;
            break;
          }
        }

        // 4. Limpieza del título y descripción
        const cleanedTitle = cleanText(command);
        
        parsedIntent = {
          entityType,
          title: cleanedTitle.length > 0 ? (cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1)) : 'Solicitud por Voz',
          description: command,
          priority,
          category: lower.includes('wi-fi') || lower.includes('wifi') || lower.includes('red') || lower.includes('internet') ? 'redes' : 'soporte',
          assigneeUid: matchedUser.uid,
          assigneeName: matchedUser.displayName
        };
      }

      // Resolver asignación final
      let finalAssigneeUid = currentUser.uid;
      let finalAssigneeName = currentUser.displayName;

      if (parsedIntent.assigneeUid) {
        finalAssigneeUid = parsedIntent.assigneeUid;
        finalAssigneeName = parsedIntent.assigneeName || currentUser.displayName;
      } else {
        // Intento secundario de resolver nombre si Gemini solo devolvió el nombre
        const lowerCmd = command.toLowerCase();
        for (const u of users) {
          const firstName = u.displayName.split(' ')[0].toLowerCase();
          if (lowerCmd.includes(firstName)) {
            finalAssigneeUid = u.uid;
            finalAssigneeName = u.displayName;
            break;
          }
        }
      }

      const year = new Date().getFullYear();
      const randStr = Math.floor(1000 + Math.random() * 9000).toString();

      if (parsedIntent.entityType === 'incident') {
        const id = `INC-${year}-${randStr}`;
        const newInc = {
          id,
          title: parsedIntent.title || 'Incidencia Registrada por Voz',
          description: parsedIntent.description || command,
          category: parsedIntent.category || 'soporte',
          impact: 'medio',
          urgency: 'medio',
          priority: parsedIntent.priority || 'media',
          status: 'abierta',
          requester: currentUser.displayName,
          assigneeId: finalAssigneeUid,
          assigneeName: finalAssigneeName,
          organizationId: currentUser.organizationId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await createDocument('incidents', newInc);
        await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Registro por Voz (IA)', 'Incidencias', id, newInc.title, `Incidencia asignada a ${finalAssigneeName}.`);
        
        // Notificar en DB al usuario ASIGNADO
        const newNotification = {
          id: `NOTIF-${Date.now()}`,
          userId: finalAssigneeUid,
          title: 'Nueva Incidencia Asignada (IA)',
          message: `Se te ha asignado la incidencia: ${newInc.title}`,
          linkModule: 'incidents',
          linkEntityId: id,
          isRead: false,
          organizationId: currentUser.organizationId,
          createdAt: new Date().toISOString()
        };
        await createDocument('notifications', newNotification);
        
        // Despachar Push Notification al teléfono/dispositivo del usuario asignado
        await sendOneSignalPush(finalAssigneeUid, newNotification.title, newNotification.message);

        toast(`Incidencia ${id} asignada a ${finalAssigneeName}`, 'success', 'incidents');
        setActiveTab('incidents');

      } else if (parsedIntent.entityType === 'meeting') {
        const id = `MEET-${year}-${randStr}`;
        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 1);
        const endTime = new Date(startTime.getTime() + 30 * 60000);

        const newMeeting = {
          id,
          title: parsedIntent.title || 'Reunión Programada por IA',
          objective: parsedIntent.description || command,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          participants: [currentUser.displayName, finalAssigneeName],
          modality: 'presencial',
          status: 'programada',
          organizationId: currentUser.organizationId,
          createdAt: new Date().toISOString()
        };
        await createDocument('meetings', newMeeting);
        await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Reunión por Voz (IA)', 'Reuniones', id, newMeeting.title, 'Programada por Agente de Voz.');

        toast(`Reunión ${id} programada por Agente de Voz`, 'success', 'meetings');
        setActiveTab('meetings');

      } else {
        // Tarea por defecto
        const id = `TASK-${year}-${randStr}`;
        const newTask = {
          id,
          title: parsedIntent.title || 'Tarea Creada por IA',
          description: parsedIntent.description || command,
          status: 'pendiente',
          priority: parsedIntent.priority || 'media',
          category: parsedIntent.category || 'soporte',
          assigneeId: finalAssigneeUid,
          assigneeName: finalAssigneeName,
          creatorId: currentUser.uid,
          creatorName: currentUser.displayName,
          dueDate: new Date().toISOString().split('T')[0],
          organizationId: currentUser.organizationId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await createDocument('tasks', newTask);
        await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Tarea por Voz (IA)', 'Tareas', id, newTask.title, `Tarea asignada a ${finalAssigneeName}.`);

        const newNotification = {
          id: `NOTIF-${Date.now()}`,
          userId: finalAssigneeUid,
          title: 'Nueva Tarea Asignada (IA)',
          message: `Se te ha asignado la tarea: ${newTask.title}`,
          linkModule: 'tasks',
          linkEntityId: id,
          isRead: false,
          organizationId: currentUser.organizationId,
          createdAt: new Date().toISOString()
        };
        await createDocument('notifications', newNotification);
        await sendOneSignalPush(finalAssigneeUid, newNotification.title, newNotification.message);

        toast(`Tarea ${id} asignada a ${finalAssigneeName}`, 'success', 'tasks');
        setActiveTab('tasks');
      }

      onClose();
    } catch (err) {
      console.error('[VoiceAgent] Error:', err);
      toast('Error al procesar comando de voz', 'error');
    } finally {
      setIsProcessing(false);
      setIsListening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl border p-6 bg-surface border-border-subtle overflow-hidden transition-all text-content-primary">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">Agente IT Inteligente</h2>
              <p className="text-xs text-content-muted">Dicta o escribe comandos de voz en español</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listening Area */}
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
          <button
            onClick={toggleListening}
            disabled={isProcessing}
            className={`relative p-6 rounded-full transition-all transform hover:scale-105 ${
              isListening
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-bounce'
                : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40'
            }`}
          >
            {isListening && (
              <span className="absolute inset-0 rounded-full bg-rose-500 opacity-75 animate-ping" />
            )}
            {isListening ? <MicOff className="w-8 h-8 relative" /> : <Mic className="w-8 h-8 relative" />}
          </button>

          <p className="text-xs text-content-muted font-medium">
            {isListening
              ? 'Escuchando tu voz... Habla libremente'
              : speechSupported
              ? 'Haz clic en el micrófono para iniciar dictado de voz'
              : 'Dictado de voz no soportado en tu navegador. Puedes escribir abajo tu comando:'}
          </p>

          {transcript && (
            <div className="w-full p-3 rounded-xl bg-surface-raised border border-cyan-500/30 text-xs font-mono text-cyan-400 italic">
              "{transcript}"
            </div>
          )}
        </div>

        {/* Manual Text Input / Command Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleProcessCommand(inputText);
          }}
          className="flex items-center gap-2 pt-2 border-t border-border-subtle"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ej: Registra una incidencia urgente por fallo en servidor a Eduardo..."
            disabled={isProcessing}
            className="flex-1 px-3 py-2 rounded-xl bg-surface-raised border border-border-subtle text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            disabled={isProcessing || !inputText.trim()}
            className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold transition-all shrink-0"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>

      </div>
    </div>
  );
};
