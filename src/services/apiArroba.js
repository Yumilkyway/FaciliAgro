// src/services/apiArroba.js

/**
 * Consulta a API pública do Ipeadata para obter a última cotação da arroba do Boi Gordo (CEPEA/B3).
 * Utiliza o protocolo OData v4.
 */
export async function obterPrecoArroba() {
  try {
    const url = "https://www.ipeadata.gov.br/api/odata4/ValoresSerie(SERCODIGO='PRECOS12_BOIGORDO12')?$top=1&$orderby=VALDATA desc";
    
    // Configura um timeout curto para evitar travar a inicialização do app caso a rede esteja ruim
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 segundos de timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.value && data.value.length > 0) {
      const registro = data.value[0];
      return {
        precoArroba: parseFloat(registro.VALVALOR),
        dataPrecoArroba: registro.VALDATA, // Formato retornado pela API (ISO com fuso ou apenas YYYY-MM-DD)
        fonte: 'Cepea/B3 via Ipeadata',
      };
    }
  } catch (error) {
    console.warn('[apiArroba] Falha ao consultar API do Ipeadata, usando fallback.', error.message);
  }
  return null;
}
