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
                maxOutputTokens: 1024,
            }
        })
        
        // Prompt base mejorado para Maxiapoyo
        const baseContext = `Eres Maxibot, un asistente virtual inteligente de Maxiapoyo que puede:
1. Responder preguntas generales con conocimiento amplio
2. Proporcionar información sobre cursos de Maxiapoyo
3. Ayudar con cualquier consulta de manera amigable y profesional

Información importante sobre Maxiapoyo:
- Las inscripciones son el 12 de diciembre
- En Habitat Solidaridad 4: cursos de maquillaje, sublimación y mecánica
- En Altares: repostería y panadería  
- Todos los cursos cuestan $400

Instrucciones de respuesta:
- Sé amigable, útil y conversacional
- Si no tienes información específica, sé honesto al respecto
- Mantén respuestas concisas pero informativas
- Usa emojis ocasionalmente para hacer la conversación más amigable

`
        
        const formatPrompt = baseContext + (prompt ? '\n\nContexto adicional: ' + prompt + '\n\n' : '\n\n') + 'Usuario pregunta: ' + text
        
        const result = await model.generateContent(formatPrompt)
        
        console.log(result) // Imprimir el resultado en la consola
        
        const response = result.response
        
        // Verificar si hay una respuesta válida
        if (response && response.text) {
            const answer = response.text()
            
            // Validar que la respuesta sea apropiada
            if (validateResponse(answer)) {
                return answer.trim() // Limpiar respuesta
            } else {
                return "Lo siento, no pude generar una respuesta adecuada. ¿Podrías reformular tu pregunta?"
            }
        } else {
            return "Lo siento, no pude procesar tu solicitud en este momento. ¿Podrías intentar reformular tu pregunta?"
        }
    } catch (error) {
        console.error('Error in Gemini chat:', error)
        
        // Respuesta de fallback más específica según el tipo de error
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                return "Error de configuración del servicio. Por favor contacta al administrador."
            } else if (error.message.includes('quota')) {
                return "El servicio está temporalmente saturado. Intenta nuevamente en unos minutos."
            }
        }
        
        return "Lo siento, ocurrió un error técnico. Intenta nuevamente o contacta al soporte si el problema persiste."
    }
}

// Función auxiliar para validar que la respuesta es apropiada
function validateResponse(response: string): boolean {
    // Verificar que la respuesta no esté vacía y tenga contenido útil
    if (!response || response.trim().length < 10) {
        return false
    }
    
    // Verificar que no contenga errores obvios
    const errorIndicators = ['undefined', 'null', 'error:', '[object Object]']
    return !errorIndicators.some(indicator => 
        response.toLowerCase().includes(indicator.toLowerCase())
    )
}
