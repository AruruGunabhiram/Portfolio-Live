import type { Certification } from '../types/portfolio';

// Canonical source of truth: public/"AWS Certified Solutions Architect - Associate certificate.pdf".
// Every field below is printed on that certificate:
//   holder     Gunabhiram Aruru
//   title      AWS Certified Solutions Architect - Associate
//   issued     August 30, 2026
//   valid thru August 30, 2029
// The certificate does NOT print an exam code, so "SAA-C03" is deliberately absent.
// The exam score is deliberately not published anywhere in this repository.
// The certificate also prints a validation number and AWS's generic verification
// landing page; neither is reproduced here. `verificationUrl` is instead this badge's
// own Credly page — issuer-hosted and specific to this credential, which the generic
// landing page printed on the PDF is not. It was checked against Credly's public
// Open Badges v2 assertion before being added: issuedOn 2026-08-30 and expires
// 2029-08-30 match the dates above, and the assertion's hashed recipient identity is
// sha256 of the portfolio owner's canonical email. That assertion publishes no score
// and no exam code, and neither does this file.
export const CERTIFICATIONS: Certification[] = [
  {
    id: 'aws-solutions-architect-associate',
    title: 'AWS Certified Solutions Architect - Associate',
    issuer: 'Amazon Web Services (AWS)',
    year: 2026,
    summary: 'Issued August 30, 2026. Valid through August 30, 2029.',
    credentialUrl: '/AWS%20Certified%20Solutions%20Architect%20-%20Associate%20certificate.pdf',
    verificationUrl: 'https://www.credly.com/badges/50a86f8b-4f5f-418d-9b9c-09058729e3dd',
  },
];
