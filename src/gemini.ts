import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Cargar variables de entorno
dotenv.config()

// Inicializar el modelo de inteligencia artificial con la clave API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Función para generar una respuesta basada en el texto del usuario
export async function chat(prompt: string = "", text: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
        })
        
        // Prompt base para un asistente de IA general
        const baseContext = `Eres un asistente de inteligencia artificial útil, amigable y conversacional. Tu objetivo es:

1. Responder preguntas de manera clara, precisa y útil
2. Proporcionar información veraz y actualizada cuando sea posible
3. Ayudar con una amplia variedad de tareas como:
   - Responder preguntas generales
   - Explicar conceptos complejos de forma simple
   - Ayudar con problemas de matemáticas, ciencias, programación
   - Asistir en tareas de escritura y creatividad
   - Proporcionar consejos prácticos
   - Resolver dudas técnicas
4. Responder todo lo que te pregunte el usuario

Instrucciones de comportamiento:
- Sé amigable, profesional y servicial
- Si no sabes algo, admítelo honestamente
- Proporciona respuestas bien estructuradas y fáciles de entender
- Usa ejemplos cuando sea útil para aclarar conceptos
- Mantén un tono conversacional natural
- Si la pregunta es ambigua, pide aclaraciones

`
        
        const formatPrompt = baseContext + (prompt ? '\n\nContexto adicional: ' + prompt + '\n\n' : '\n\n') + 'Usuario: ' + text
        
        const result = await model.generateContent(formatPrompt)
        
        console.log('Gemini API Response:', result) // Log para debugging
        
        const response = result.response
        
        // Verificar si hay una respuesta válida
        if (response && response.text) {
            const answer = response.text()
            
            // Validar que la respuesta sea apropiada
            if (validateResponse(answer)) {
                return answer.trim()
            } else {
                return "Lo siento, no pude generar una respuesta adecuada. ¿Podrías reformular tu pregunta de otra manera?"
            }
        } else {
            return "Lo siento, no pude procesar tu solicitud en este momento. Por favor, intenta nuevamente."
        }
    } catch (error) {
        console.error('Error in Gemini chat:', error)
        
        // Respuesta de fallback más específica según el tipo de error
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                return "Error de configuración del servicio. Verifica que la API key de Gemini esté configurada correctamente."
            } else if (error.message.includes('quota') || error.message.includes('limit')) {
                return "El servicio ha alcanzado su límite de uso. Intenta nuevamente en unos minutos."
            } else if (error.message.includes('blocked') || error.message.includes('safety')) {
                return "Lo siento, no puedo procesar esta solicitud debido a políticas de seguridad. Intenta reformular tu pregunta."
            }
        }
        
        return "Ocurrió un error técnico inesperado. Por favor, intenta nuevamente."
    }
}

// Función auxiliar para validar que la respuesta es apropiada
function validateResponse(response: string): boolean {
    // Verificar que la respuesta no esté vacía y tenga contenido útil
    if (!response || response.trim().length < 5) {
        return false
    }
    
    // Verificar que no contenga errores obvios
    const errorIndicators = [
        'undefined', 
        'null', 
        'error:', 
        '[object Object]',
        'NaN',
        'TypeError',
        'ReferenceError'
    ]
    
    const lowerResponse = response.toLowerCase()
    return !errorIndicators.some(indicator => 
        lowerResponse.includes(indicator.toLowerCase())
    )
}

// Función opcional para limpiar el historial de conversación si lo implementas
export function clearHistory(): void {
    console.log('Historial de conversación limpiado')
    // Aquí puedes implementar lógica adicional si manejas historial
}