import { createBot, createProvider, createFlow, addKeyword } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { MetaProvider as Provider } from '@builderbot/provider-meta'
import { chat } from './gemini'

const PORT = process.env.PORT ?? 3008

// Flujo de conversación general que maneja todos los mensajes 
const flowConversacionGeneral = addKeyword<Provider, Database>(['.*'])
    .addAction(async (ctx, { flowDynamic }) => {
        const text = ctx.body
        
        try {
            const response = await chat("", text)
            await flowDynamic(response)
        } catch (error) {
            console.error('Error processing message:', error)
            await flowDynamic('Lo siento, ocurrió un error al procesar tu mensaje. Intenta nuevamente.')
        }
    })

const main = async () => {
    const adapterFlow = createFlow([flowConversacionGeneral])
    
    // Configurar proveedor
    const adapterProvider = createProvider(Provider, {
        jwtToken: process.env.META_JWT_TOKEN || 'jwtToken',
        numberId: process.env.META_NUMBER_ID || 'numberId',
        verifyToken: process.env.META_VERIFY_TOKEN || 'verifyToken',
        version: process.env.META_VERSION || 'v18.0'
    })
    
    const adapterDB = new Database()

    const { httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    console.log('🤖 Bot iniciado correctamente')
    httpServer(+PORT)
}

main().catch(console.error)
