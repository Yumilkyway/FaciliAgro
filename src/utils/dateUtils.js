// src/utils/dateUtils.js
// Funções auxiliares para cálculo de idade, categoria e status de vacina

/**
 * Calcula idade em meses e anos a partir da data de nascimento.
 * @param {string} birthDateISO - data no formato 'YYYY-MM-DD'
 * @returns {{ years: number, months: number, totalMonths: number, label: string }}
 */
export function calcularIdade(birthDateISO) {
  if (!birthDateISO) return { years: 0, months: 0, totalMonths: 0, label: '-' };

  const nascimento = new Date(birthDateISO);
  const hoje = new Date();

  let totalMonths =
    (hoje.getFullYear() - nascimento.getFullYear()) * 12 +
    (hoje.getMonth() - nascimento.getMonth());

  if (hoje.getDate() < nascimento.getDate()) {
    totalMonths -= 1;
  }
  if (totalMonths < 0) totalMonths = 0;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  let label;
  if (years >= 1) {
    label = months > 0 ? `${years} ano${years > 1 ? 's' : ''} e ${months} m` : `${years} ano${years > 1 ? 's' : ''}`;
  } else {
    label = `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }

  return { years, months, totalMonths, label };
}

// Define a categoria do animal conforme a idade 
export function calcularCategoria(birthDateISO, sexo) {
  const { totalMonths } = calcularIdade(birthDateISO);

  if (totalMonths < 8) return 'Bezerro(a)';
  if (totalMonths < 24) return sexo === 'Macho' ? 'Novilho' : 'Novilha';
  return sexo === 'Macho' ? 'Boi' : 'Vaca';
}

// Verifica se a vacinação está em dia, pendente ou atrasada.

export function statusVacina(dataUltimaVacinaISO) {
  if (!dataUltimaVacinaISO) return 'Pendente';

  const ultima = new Date(dataUltimaVacinaISO);
  const hoje = new Date();
  const diffDias = (hoje - ultima) / (1000 * 60 * 60 * 24);

  return diffDias <= 180 ? 'Em dia' : 'Pendente';
}

export function formatarDataBR(dataISO) {
  if (!dataISO) return '-';
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}
