import { TagPreparo } from '../enums/tag-preparo.enum';

/**
 * DICIONÁRIO DE PESOS (REGRAS DE NEGÓCIO)
 * ---------------------------------------
 * O cálculo baseia-se em 3 pilares nutricionais:
 * 1. Métodos de Preparo: Recompensa cozimento e penaliza imersão em óleo.
 * 2. Processamento: Valoriza ingredientes frescos e pune aditivos químicos.
 * 3. Densidade Nutricional: Fibras e proteínas somam; sódio e açúcar subtraem.
 */
const PESOS_NUTRICIONAIS: Record<TagPreparo, number> = {
  // --- POSITIVOS (Bônus de Saúde) ---
  [TagPreparo.IN_NATURA]: 20,           // Máximo frescor, zero processamento
  [TagPreparo.COZIDO_NO_VAPOR]: 15,     // Preserva 90% das vitaminas
  [TagPreparo.ORGANICO]: 15,            // Livre de agrotóxicos e defensivos
  [TagPreparo.SEM_ACUCAR_ADICIONADO]: 15, // Prevenção de picos de insulina
  [TagPreparo.RICO_EM_FIBRAS]: 15,      // Melhora a digestão e saciedade
  [TagPreparo.ANTIOXIDANTE]: 15,        // Combate radicais livres
  [TagPreparo.GRELHADO]: 10,            // Baixo uso de gordura adicionada
  [TagPreparo.ARTESANAL]: 10,           // Feito no local, sem conservantes industriais
  [TagPreparo.RICO_EM_PROTEINA]: 10,    // Importante para construção muscular
  [TagPreparo.BAIXO_SODIO]: 10,         // Saúde cardiovascular (pressão arterial)
  [TagPreparo.PLANT_BASED]: 10,         // Alimentos densos em nutrientes vegetais
  [TagPreparo.ZERO_ADOCA_ARTIFICIAL]: 10, // Evita adoçantes sintéticos (ex: aspartame)
  [TagPreparo.ASSADO]: 8,               // Uso moderado de calor seco
  [TagPreparo.LOW_CARB]: 5,             // Controle de carboidratos refinados
  [TagPreparo.CETOGENICA]: 5,           // Foco em gorduras boas
  [TagPreparo.VEGANO]: 5,               // Geralmente rico em vegetais
  [TagPreparo.REFOGADO]: 5,             // Pouco óleo, selagem rápida
  [TagPreparo.MINIMAMENTE_PROCESSADO]: 5, // Apenas cortado/lavado/congelado
  [TagPreparo.VEGETARIANO]: 3,          // Inclusão de derivados animais magros
  
  // --- NEUTROS (Filtros de Restrição) ---
  [TagPreparo.SEM_GLUTEN]: 0,           // Restrição alérgica (não altera saúde per se)
  [TagPreparo.ZERO_LACTOSE]: 0,         // Restrição digestiva (não altera saúde per se)

  // --- NEGATIVOS (Penalidades) ---
  [TagPreparo.DEFUMADO]: -5,            // Presença de nitritos e hidrocarbonetos
  [TagPreparo.ALTO_SODIO]: -25,         // Risco de hipertensão e retenção hídrica
  [TagPreparo.FRITO]: -30,              // Oxidação de gorduras e alta caloria
  [TagPreparo.ACUCAR_REFINADO]: -30,    // Calorias vazias e inflamação
  [TagPreparo.ULTRAPROCESSADO]: -35,    // Presença de corantes e estabilizantes
  [TagPreparo.GORDURA_TRANS]: -40,      // Risco máximo para artérias e coração
};

/**
 * MOTOR DE RECOMENDAÇÃO (ALGORITMO)
 * ----------------------------------
 * Lógica: Nota Final = 50 (Base) + Σ(Pesos das Tags Selecionadas)
 * * Exemplo prático:
 * Salada (Base 50) + In-Natura (20) + Orgânico (15) + Baixo Sódio (10) = 95 pts.
 * Hambúrguer (Base 50) + Frito (-30) + Ultraprocessado (-35) + Alto Sódio (-25) = -40 pts (Clamped to 0).
 */
export function calcularHealthScore(tags: TagPreparo[] = []): number {
  const PONTO_PARTIDA = 50; // Começamos com uma nota mediana (nem ruim, nem ótima)
  
  const somaTotal = tags.reduce((acumulador, tag) => {
    // Busca o peso no dicionário. Se a tag for nova e não mapeada, soma 0.
    const peso = PESOS_NUTRICIONAIS[tag] ?? 0;
    return acumulador + peso;
  }, PONTO_PARTIDA);

  /**
   * MECANISMO DE CLAMP (TRAVA)
   * Math.max(soma, 0) -> Garante que a nota nunca seja negativa.
   * Math.min(resultado, 100) -> Garante que a nota nunca ultrapasse 100.
   */
  return Math.min(Math.max(somaTotal, 0), 100);
}