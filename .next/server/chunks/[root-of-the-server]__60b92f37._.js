module.exports = {

"[project]/.next-internal/server/app/api/tracking/batch/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/src/app/api/tracking/batch/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "POST": (()=>POST)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const JADLOG_API_URL = 'https://prd-traffic.jadlogtech.com.br/embarcador/api/tracking/simples/consultar';
const BATCH_SIZE = 100; // Máximo permitido pela API da Jadlog
const DELAY_BETWEEN_BATCHES = 2000; // 2 segundos entre lotes para evitar rate limiting
async function POST(request) {
    try {
        const { numeroOperacionais } = await request.json();
        if (!numeroOperacionais || !Array.isArray(numeroOperacionais)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Lista de números operacionais é obrigatória'
            }, {
                status: 400
            });
        }
        if (numeroOperacionais.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                results: []
            });
        }
        // Dividir em lotes de acordo com o limite da API
        const batches = [];
        for(let i = 0; i < numeroOperacionais.length; i += BATCH_SIZE){
            batches.push(numeroOperacionais.slice(i, i + BATCH_SIZE));
        }
        const allResults = [];
        let processedCount = 0;
        // Processar cada lote com delay
        for(let batchIndex = 0; batchIndex < batches.length; batchIndex++){
            const batch = batches[batchIndex];
            try {
                // Preparar consulta para o lote atual
                const consulta = batch.map((numeroOperacional)=>({
                        pedido: numeroOperacional
                    }));
                // Fazer chamada para a API da Jadlog
                const response = await fetch(JADLOG_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.JADLOG_API_TOKEN || 'demo-token'}`
                    },
                    body: JSON.stringify({
                        consulta
                    })
                });
                if (!response.ok) {
                    console.error(`Erro na API Jadlog para lote ${batchIndex + 1}:`, response.status);
                    // Adicionar resultados de erro para este lote
                    batch.forEach((numeroOperacional)=>{
                        allResults.push({
                            numeroOperacional,
                            success: false,
                            error: `Erro HTTP ${response.status}`
                        });
                    });
                } else {
                    const data = await response.json();
                    // Processar resultados do lote
                    if (data.consulta && Array.isArray(data.consulta)) {
                        data.consulta.forEach((item, index)=>{
                            const numeroOperacional = batch[index];
                            if (item.tracking) {
                                allResults.push({
                                    numeroOperacional,
                                    success: true,
                                    tracking: {
                                        status: item.tracking.status || 'Não disponível',
                                        ultimaAtualizacao: item.tracking.dtEmissao || new Date().toLocaleDateString('pt-BR'),
                                        previsaoEntrega: item.previsaoEntrega,
                                        eventos: item.tracking.eventos || []
                                    }
                                });
                            } else {
                                allResults.push({
                                    numeroOperacional,
                                    success: false,
                                    error: 'Tracking não encontrado'
                                });
                            }
                        });
                    } else {
                        // Se não há dados de consulta, marcar todos como erro
                        batch.forEach((numeroOperacional)=>{
                            allResults.push({
                                numeroOperacional,
                                success: false,
                                error: 'Resposta inválida da API'
                            });
                        });
                    }
                }
                processedCount += batch.length;
                // Delay entre lotes (exceto no último)
                if (batchIndex < batches.length - 1) {
                    await new Promise((resolve)=>setTimeout(resolve, DELAY_BETWEEN_BATCHES));
                }
            } catch (error) {
                console.error(`Erro ao processar lote ${batchIndex + 1}:`, error);
                // Adicionar resultados de erro para este lote
                batch.forEach((numeroOperacional)=>{
                    allResults.push({
                        numeroOperacional,
                        success: false,
                        error: 'Erro de conexão'
                    });
                });
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            results: allResults,
            summary: {
                total: numeroOperacionais.length,
                processed: processedCount,
                successful: allResults.filter((r)=>r.success).length,
                failed: allResults.filter((r)=>!r.success).length,
                batches: batches.length
            }
        });
    } catch (error) {
        console.error('Erro na API de consulta em lote:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Erro interno do servidor'
        }, {
            status: 500
        });
    }
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__60b92f37._.js.map