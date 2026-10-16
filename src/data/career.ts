export interface Role {
  readonly id: string;
  readonly company: string;
  readonly summary?: string;
}

export const currentRole: Role = {
  id: 'salesforce',
  company: 'Salesforce',
  summary: 'director of product, emerging technology. 2025 to present. enterprise ai adoption, 0 to 1: how large organizations actually absorb ai, and what makes it stick after the first rollout.',
};

export const pastRoles: readonly Role[] = [
  {
    id: 'siriusxm',
    company: 'SiriusXM',
    summary: 'cross-platform listening growth for 34M subscribers across mobile, web, and in-car. 18% more daily sessions, 12% less voluntary churn in the first 90 days, and 3x the shipping cadence.',
  },
  {
    id: 'disney-plus',
    company: 'Disney/ESPN',
    summary: 'global launch operations: the orchestration layer that let teams localize and certify content, payments, and ux strings. 60+ markets live with feature parity on day one, 35% faster localization.',
  },
  { id: 'hyperscience', company: 'Hyperscience' },
  {
    id: 'ea-sports',
    company: 'EA Sports',
    summary: 'built the EA Sports companion app from zero: hired a 40-person team, ran two betas at 90% csat and 86% weekly retention, and handed off what became the EA Sports App.',
  },
];

export const pastEmployers: string = new Intl.ListFormat('en', { type: 'conjunction' }).format(
  pastRoles.map((role) => role.company),
);
