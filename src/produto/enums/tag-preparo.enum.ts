export enum TagPreparo {
  // ==========================================
  // 1. MÉTODOS DE PREPARO (Como é feito)
  // ==========================================
  IN_NATURA = 'in-natura',               // Cru, fresco (ex: saladas, frutas)
  COZIDO_NO_VAPOR = 'cozido-no-vapor',   // Preserva nutrientes
  GRELHADO = 'grelhado',                 // Menos óleo
  ASSADO = 'assado',                     // Forno
  REFOGADO = 'refogado',                 // Levemente passado na panela
  DEFUMADO = 'defumado',                 // Carnes curadas/defumadas
  FRITO = 'frito',                       // Fritura em imersão (perde muitos pontos)

  // ==========================================
  // 2. NÍVEL DE PROCESSAMENTO (A origem)
  // ==========================================
  ORGANICO = 'organico',                 // Livre de agrotóxicos
  ARTESANAL = 'artesanal',               // Feito do zero no restaurante, sem conservantes
  MINIMAMENTE_PROCESSADO = 'minimamente-processado', // Cortado, embalado, mas natural
  ULTRAPROCESSADO = 'ultraprocessado',   // Salsicha, bacon, molhos artificiais (perde pontos)

  // ==========================================
  // 3. PERFIL NUTRICIONAL (O que tem dentro)
  // ==========================================
  RICO_EM_FIBRAS = 'rico-em-fibras',     // Grãos integrais, aveia
  RICO_EM_PROTEINA = 'rico-em-proteina', // Frango, whey, ovos, soja
  BAIXO_SODIO = 'baixo-sodio',           // Comida pouco salgada
  ALTO_SODIO = 'alto-sodio',             // Fast food, embutidos (perde pontos)
  SEM_ACUCAR_ADICIONADO = 'sem-acucar-adicionado', // Adoçado com frutas ou natural
  ACUCAR_REFINADO = 'acucar-refinado',   // Doces tradicionais (perde pontos)
  GORDURA_TRANS = 'gordura-trans',       // Margarina, fritura velha (penalidade máxima)
  ANTIOXIDANTE = 'antioxidante',         // Frutas vermelhas, açaí puro, chá verde

  // ==========================================
  // 4. ESTILOS DE DIETA (Público-alvo)
  // ==========================================
  VEGANO = 'vegano',                     // Sem nenhum produto animal
  VEGETARIANO = 'vegetariano',           // Pode ter ovo/leite
  LOW_CARB = 'low-carb',                 // Baixo carboidrato
  CETOGENICA = 'cetogenica',             // Alta gordura boa, zero carbo (Keto)
  PLANT_BASED = 'plant-based',           // Foco 100% em plantas inteiras

  // ==========================================
  // 5. RESTRIÇÕES E ALERGIAS (Filtros de segurança)
  // ==========================================
  SEM_GLUTEN = 'sem-gluten',             // Celíacos
  ZERO_LACTOSE = 'zero-lactose',         // Intolerantes
  ZERO_ADOCA_ARTIFICIAL = 'zero-adocante-artificial' // Sem sucralose/aspartame
}