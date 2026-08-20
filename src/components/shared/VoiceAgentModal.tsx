import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, X, Loader2, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { createDocument, logActivity, sendOneSignalPush } from '../../services/supabaseService';
import { GoogleGenAI } from '@google/genai';

interface VoiceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAgentModal: React.FC<VoiceAgentModalProps> = ({ isOpen, onClose }) => {
  const { toast, setActiveTab } = useApp();
  const { currentUser } = useAuth();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Feature detection for Web Speech API
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

  const handleProcessCommand = async (command: string) => {
    if (!command.trim() || !currentUser) return;
    setIsProcessing(true);

    try {
      let parsedIntent: any = null;

      // Check if Gemini API Key is present in environment
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `Analiza este comando de un portal IT: "${command}". 
Determina el tipo (incident, task, meeting, project) y extrae datos clave en formato JSON strictly:
{
  "entityType": "task" | "incident" | "meeting" | "project",
  "title": "título sintético en español",
  "description": "descripción resumida",
  "priority": "baja" | "media" | "alta" | "critica",
  "category": "soporte" | "hardware" | "redes" | "sistemas" | "seguridad" | "mantenimiento"
}`
          });
          const text = response.text || '';
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedIntent = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.warn('[VoiceAgent] Fallback AI error:', e);
        }
      }

      // Rule-based fallback parsing if AI key not configured or failed
      if (!parsedIntent) {
        const lower = command.toLowerCase();
        let entityType = 'task';
        if (lower.includes('incidencia') || lower.includes('falla') || lower.includes('error') || lower.includes('roto')) {
          entityType = 'incident';
        } else if (lower.includes('reunión') || lower.includes('reunion') || lower.includes('cita')) {
          entityType = 'meeting';
        } else if (lower.includes('proyecto')) {
          entityType = 'project';
        }

        let priority = 'media';
        if (lower.includes('alta') || lower.includes('urgente') || lower.includes('crítica') || lower.includes('critica')) {
          priority = lower.includes('crítica') || lower.includes('critica') ? 'critica' : 'alta';
        } else if (lower.includes('baja')) {
          priority = 'baja';
        }

        parsedIntent = {
          entityType,
          title: command.length > 50 ? command.substring(0, 50) + '...' : command,
          description: `Generado por Agente de Voz: "${command}"`,
          priority,
          category: 'soporte'
        };
      }

      const year = new Date().getFullYear();
      const randStr = Math.floor(1000 + Math.random() * 9000).toString();

      if (parsedIntent.entityType === 'incident') {
        const id = `INC-${year}-${randStr}`;
        const newInc = {
          id,
          title: parsedIntent.title || 'Incidencia de Voz',
          description: parsedIntent.description || command,
          category: parsedIntent.category || 'soporte',
          impact: 'medio',
          urgency: 'medio',
          priority: parsedIntent.priority || 'media',
          status: 'abierta',
          requester: currentUser.displayName,
          assigneeId: currentUser.uid,
          assigneeName: currentUser.displayName,
          organizationId: currentUser.organizationId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await createDocument('incidents', newInc);
        await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Registro por Voz (IA)', 'Incidencias', id, newInc.title, 'Creado por Agente de Voz.');
        
        const newNotification = {
          id: `NOTIF-${Date.now()}`,
          userId: currentUser.uid,
          title: 'Incidencia Registrada por Agente IA',
          message: `Se creó la incidencia: ${newInc.title}`,
          linkModule: 'incidents',
          linkEntityId: id,
          isRead: false,
          organizationId: currentUser.organizationId,
          createdAt: new Date().toISOString()
        };
        await createDocument('notifications', newNotification);
        await sendOneSignalPush(currentUser.uid, newNotification.title, newNotification.message);

        toast(`Incidencia ${id} creada por Agente de Voz`, 'success', 'incidents');
        setActiveTab('incidents');

      } else if (parsedIntent.entityType === 'meeting') {
        const id = `MEET-${year}-${randStr}`;
        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 1);
        const endTime = new Date(startTime.getTime() + 30 * 60000);

        const newMeeting = {
          id,
          title: parsedIntent.title || 'Reunión de Voz',
          objective: command,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          participants: [currentUser.displayName],
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
        // Default: Task
        const id = `TASK-${year}-${randStr}`;
        const newTask = {
          id,
          title: parsedIntent.title || 'Tarea de Voz',
          description: parsedIntent.description || command,
          status: 'pendiente',
          priority: parsedIntent.priority || 'media',
          category: parsedIntent.category || 'soporte',
          assigneeId: currentUser.uid,
          assigneeName: currentUser.displayName,
          creatorId: currentUser.uid,
          creatorName: currentUser.displayName,
          dueDate: new Date().toISOString().split('T')[0],
          organizationId: currentUser.organizationId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await createDocument('tasks', newTask);
        await logActivity(currentUser.uid, currentUser.displayName, currentUser.role, 'Tarea por Voz (IA)', 'Tareas', id, newTask.title, 'Creada por Agente de Voz.');

        const newNotification = {
          id: `NOTIF-${Date.now()}`,
          userId: currentUser.uid,
          title: 'Nueva Tarea Creada por Agente IA',
          message: `Se creó la tarea: ${newTask.title}`,
          linkModule: 'tasks',
          linkEntityId: id,
          isRead: false,
          organizationId: currentUser.organizationId,
          createdAt: new Date().toISOString()
        };
        await createDocument('notifications', newNotification);
        await sendOneSignalPush(currentUser.uid, newNotification.title, newNotification.message);

        toast(`Tarea ${id} creada por Agente de Voz`, 'success', 'tasks');
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
            placeholder="Ej: Registra una incidencia urgente por fallo en servidor..."
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
