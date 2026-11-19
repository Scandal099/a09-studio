export const studioContact = {
  email: "",
  socials: [] as { name: string; url: string }[],
};

export const studies = [
  { name: "Folded metal", kind: "Material study", image: "/art/metal.webp", small: "/art/metal-small.webp", alt: "Two brushed titanium planes folding into a single ribbon." },
  { name: "Concrete wall", kind: "Spatial study", image: "/art/wall-wide.webp", small: "/art/wall-small.webp", alt: "A/09 spray-painted onto concrete, with a blurred pedestrian for scale." },
  { name: "Slash poster", kind: "Graphic study", image: "/art/poster.webp", small: "/art/poster.webp", alt: "Original A/09 poster with a dark diagonal cutting between the A and 09." },
];

export const projects = [
  { id: "001", title: "Terrain Index", type: "Editorial platform", year: "2026", image: "/art/terrain.webp", alt: "A densely folded alpine ridge in black and white.", look: "terrain", scope: "Art direction + development", idea: "An independent field journal for landscape and geology. The reading experience moves between the scale of a mountain and the detail of a single fold.", design: "A photographic index opens into long-form field notes. Wide images, quiet captions and a compact reading column set the pace.", deliverables: "Editorial design system / Responsive website / Image index" },
  { id: "002", title: "The Art of Becoming", type: "Visual identity", year: "2026", image: "/art/poster.webp", alt: "A/09 identity poster printed in black on pale stock.", look: "poster", scope: "Identity + digital design", idea: "An internal identity study for A/09. A single slash carries the eye from an initial letter to a resolved number.", design: "The printed composition becomes a responsive graphic system. Moving type, sharp crops and a restrained grid keep the mark recognisable across scales.", deliverables: "Art direction / Poster system / Motion language" },
  { id: "003", title: "Mono Editions", type: "Music & culture", year: "2026", image: "/art/mono.webp", alt: "A black vinyl record partly drawn from a graphic MONO sleeve.", look: "record", scope: "UI/UX + development", idea: "A digital catalogue for an imagined independent record label. Each release begins with its sleeve and leaves room for the story behind the pressing.", design: "A modular release page pairs the artwork with a track list, credits and listening controls. The index can grow without changing its rhythm.", deliverables: "Information architecture / Release catalogue / Interface concept" },
  { id: "004", title: "Concrete Type", type: "Spatial identity", year: "2026", image: "/art/wall.webp", alt: "The original A/09 stencil on concrete with a passer-by.", look: "wall", scope: "Art direction + interaction", idea: "A study of a digital mark at the scale of a building. Stencil breaks, the grain of the wall and a passing figure give the identity a physical measure.", design: "An architectural campaign frame becomes a scroll-driven scene. The camera moves toward the stencil and the diagonal leads into the next chapter.", deliverables: "Environmental graphics / Campaign direction / Interactive scene" },
] as const;
export type Project = (typeof projects)[number];

export const services = [
  { title: "Web design", copy: "Distinctive digital identities, built around purpose. From art direction and typography to a responsive system your team can use." },
  { title: "Web development", copy: "From the first working prototype to launch. Fast, accessible websites with a content structure that grows with your business." },
  { title: "UI & UX", copy: "Clear paths through complex products. We map the user journey, prototype the interface and test the details that shape everyday use." },
  { title: "Digital experiences", copy: "Interactive campaigns, motion studies and digital tools. We use movement where it gives an idea a clearer form." },
];
export const stages = [
  { name: "Discover", text: "Conversations, research and a close look at what makes your business distinct." },
  { name: "Define", text: "A shared brief, a clear structure and a visual direction to build around." },
  { name: "Design", text: "Type, image and interaction brought together in a working prototype." },
  { name: "Develop", text: "Production code, careful testing and a considered handover at launch." },
];
