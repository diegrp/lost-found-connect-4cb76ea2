export const categoryTranslations: Record<string, string> = {
  electronics: "Eletrônicos",
  documents: "Documentos",
  clothing: "Roupas",
  accessories: "Acessórios",
  bags: "Bolsas",
  keys: "Chaves",
  jewelry: "Joias",
  sports: "Esportes",
  books: "Livros",
  other: "Outros",
};

export const getCategoryLabel = (category: string): string => {
  return categoryTranslations[category] || category;
};
