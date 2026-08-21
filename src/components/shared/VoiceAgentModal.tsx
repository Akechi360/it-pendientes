import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, X, Loader2, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { createDocument, logActivity, sendOneSignalPush } from '../../services/supabaseService';
import { useRealtimeQuery } from '../../hooks/useRealtimeQuery';

interface VoiceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAgentModal: React.FC<VoiceAgentModalProps> = ({ isOpen, onClose }) => {
  const { toast, setActiveTab } = useApp();
  const { currentUser } = useAuth();

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
    let cleaned = raw
      .replace(/^(crea|creame|registra|registrame|agrega|agregame|nueva|nuevo)\s+(una|un)?\s*(incidencia|tarea|reunion|reunión|proyecto)?\s*(para|sobre|con)?\s*/i, '')
      .replace(/\s*y?\s*asígna(sela|la|lo)?\s*(de\s+manera\s+\w+)?\s*a\s+[\w\s]+/gi, '')
      .replace(/\s*asígna(sela|la|lo)?\s*(de\s+manera\s+\w+)?\s*a\s+[\w\s]+/gi, '')
      .replace(/\s*en\s+base\s+a\s+una\s+prueba.*/gi, '')
      .trim();
    
    if (!cleaned || cleaned.length < 3) {
      cleaned = 'Prueba de Incidencia IT';
    }
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  };

  const handleProcessCommand = async (command: string) => {
    if (!command.trim() || !currentUser) return;
    setIsProcessing(true);

    try {
      let parsedIntent: any = null;
      const membersText = users.map(u => `- ${u.displayName} (UID: ${u.uid})`).join('\n');

      // 1. Intentar Serverless API /api/parse-voice primero
      try {
        const resp = await fetch('/api/parse-voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command, membersText })
        });
        if (resp.ok) {
          const resData = await resp.json();
          if (resData.success && resData.data) {
            parsedIntent = resData.data;
          }
        }
      } catch (e) {
        console.warn('[VoiceAgent] Serverless API parse-voice fallback:', e);
      }

      // 2. Intentar llamada directa del cliente si Gemini API Key está disponible en el cliente
      if (!parsedIntent) {
        const rawApiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || '';
        const apiKey = typeof rawApiKey === 'string' ? rawApiKey.trim() : '';

        if (apiKey) {
          try {
            const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `Eres un asistente de IA para un Portal IT de una clínica. Analiza este dictado por voz en español: "${command}".

Miembros del equipo disponibles:
${membersText || '- Eduardo Toro\n- Manuel Pérez'}

REGLAS STRICTAS:
1. "title": Título técnico súper profesional y sintético del problema (máximo 6 palabras). Elimina COMPLETAMENTE las instrucciones de asignación (ej: "asignale esta incidencia a Eduardo", "urgente a Eduardo", "registra una incidencia...").
   - Ejemplo de voz: "Se cayó el wi-fi en hospitalización en la habitación de dos asignale esta incidencia de manera urgente a Eduardo"
   - Título correcto: "Fallo de Cobertura Wi-Fi en Habitación 2 de Hospitalización"
2. "description": Descripción técnica clara del problema reportado omitiendo las ordenes de asignación o meta-comandos.
3. "priority": "critica" si mencionan "urgente" o "crítica", si no "alta", "media" o "baja".
4. "assigneeUid" y "assigneeName": El usuario asignado si lo mencionan.

Responde ÚNICAMENTE con esta estructura JSON sin markdown:
{
  "entityType": "incident",
  "title": "string",
  "description": "string",
  "priority": "critica",
  "category": "redes",
  "assigneeUid": "string o null",
  "assigneeName": "string o null"
}`
                  }]
                }],
                generationConfig: {
                  temperature: 0.1,
                  responseMimeType: "application/json"
                }
              })
            });

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              const textContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textContent) {
                parsedIntent = JSON.parse(textContent);
              }
            }
          } catch (e) {
            console.warn('[VoiceAgent] Direct Gemini Fetch fallback:', e);
          }
        }
      }

      // 3. Motor de Reglas Local (Fallback ultra-resistente si no hay conectividad ni API key)
      if (!parsedIntent) {
        const lower = command.toLowerCase();

        let entityType = 'task';
        if (lower.includes('incidencia') || lower.includes('falla') || lower.includes('error') || lower.includes('roto') || lower.includes('problema')) {
          entityType = 'incident';
        } else if (lower.includes('reunión') || lower.includes('reunion') || lower.includes('cita')) {
          entityType = 'meeting';
        } else if (lower.includes('proyecto')) {
          entityType = 'project';
        }

        let priority = 'media';
        if (lower.includes('urgente') || lower.includes('crítica') || lower.includes('critica')) {
          priority = 'critica';
        } else if (lower.includes('alta')) {
          priority = 'alta';
        } else if (lower.includes('baja')) {
          priority = 'baja';
        }

        let matchedUser = currentUser;
        for (const u of users) {
          const firstName = u.displayName.split(' ')[0].toLowerCase();
          if (lower.includes(firstName)) {
            matchedUser = u;
            break;
          }
        }

        const cleanedTitle = cleanText(command);
        
        parsedIntent = {
          entityType,
          title: cleanedTitle,
          description: `Fallo reportado por voz: ${cleanedTitle}`,
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
            id="voice-command-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ej: Registra una incidencia urgente por fallo en servidor a Eduardo..."
            disabled={isProcessing}
            className="flex-1 px-3 py-2 rounded-xl bg-surface-raised border border-border-subtle text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-cyan-500/50"
          />
          <button
            type="submit"
            id="voice-command-submit"
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
