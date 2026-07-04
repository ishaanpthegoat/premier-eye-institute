export const site = {
  name: "Premier Eye Institute",
  legalName: "Premier Eye Institute, OD, PLLC",
  tagline: "Eye care, refined",
  doctor: "Dr. Nisha P. Mehta, OD",
  founded: 2014,
  phone: "919-734-2273",
  phoneHref: "tel:9197342273",
  phoneDisplay: "(919) 734-2273",
  fax: "919-238-4321",
  address: {
    street: "2531 E Lyon Station Rd, Suite F",
    city: "Creedmoor",
    state: "NC",
    zip: "27522",
  },
  addressLine: "2531 E Lyon Station Rd, Suite F, Creedmoor, NC 27522",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Premier+Eye+Institute+2531+E+Lyon+Station+Rd+Suite+F+Creedmoor+NC+27522",
  mapsEmbedSrc:
    "https://www.google.com/maps?q=2531+E+Lyon+Station+Rd+Suite+F,+Creedmoor,+NC+27522&output=embed",
  portalUrl: "https://crystalpm.com",
  facebook: "https://facebook.com/PEIcareNC",
  twitter: "https://twitter.com/PEIcareNC",
  currentSite: "https://peicare.com",
} as const;

export const hours = [
  { day: "Monday", value: "8:00 am – 5:00 pm" },
  { day: "Tuesday", value: "8:00 am – 5:00 pm" },
  { day: "Wednesday", value: "8:00 am – 5:00 pm" },
  { day: "Thursday", value: "9:00 am – 6:00 pm" },
  { day: "Friday", value: "8:00 am – 3:00 pm" },
  { day: "Saturday", value: "By Appointment Only" },
  { day: "Sunday", value: "Closed" },
] as const;

export const hoursCompact = [
  { label: "Mon – Wed", value: "8:00a – 5:00p" },
  { label: "Thursday", value: "9:00a – 6:00p" },
  { label: "Friday", value: "8:00a – 3:00p" },
  { label: "Saturday", value: "By Appointment Only" },
  { label: "Sunday", value: "Closed" },
] as const;

export type Service = {
  slug: string;
  title: string;
  short: string;
  long: string;
  icon:
    | "eye"
    | "contact"
    | "moon"
    | "droplet"
    | "sparkles"
    | "monitor"
    | "activity"
    | "gauge"
    | "glasses"
    | "sun";
};

export const services: Service[] = [
  {
    slug: "eye-exams",
    title: "Eye & Vision Exams",
    short:
      "Unhurried, comprehensive exams for the whole family — vision, eye health, and early detection in one calm visit.",
    long: "A full exam checks far more than how well you read a chart. We evaluate your vision, screen for eye disease, and look at the overall health of your eyes — for kids, adults, and seniors alike.",
    icon: "eye",
  },
  {
    slug: "contact-lenses",
    title: "Contact Lens Exams & Fittings",
    short:
      "Precise fittings and training for daily, monthly, and specialty lenses that feel like nothing at all.",
    long: "Contacts should be comfortable from morning to night. We measure your eyes, match you to the right lens, and teach you how to wear and care for them with confidence.",
    icon: "contact",
  },
  {
    slug: "ortho-k",
    title: "Ortho-K Contacts",
    short:
      "Special lenses worn overnight that gently reshape the eye — wake up and see clearly, no glasses needed.",
    long: "Orthokeratology (Ortho-K) uses custom lenses worn while you sleep to temporarily reshape the front of the eye. Many patients see clearly all day without glasses or daytime contacts.",
    icon: "moon",
  },
  {
    slug: "dry-eye",
    title: "Dry Eye Treatment",
    short:
      "Targeted relief for tired, gritty, irritated eyes — so long days stop costing you comfort.",
    long: "Dry eye is one of the most common reasons patients visit us. We find the cause — not just the symptom — and build a treatment plan that brings lasting relief.",
    icon: "droplet",
  },
  {
    slug: "lasik",
    title: "LASIK Co-Management",
    short:
      "Thinking about LASIK? We handle your pre-surgery evaluation and post-surgery care, close to home.",
    long: "We work alongside trusted LASIK surgeons: we determine whether you're a good candidate, prepare you for surgery, and manage your follow-up care right here in Creedmoor.",
    icon: "sparkles",
  },
  {
    slug: "computer-vision",
    title: "Computer Vision Care",
    short:
      "Help for eye strain, headaches, and blur from long hours on screens.",
    long: "Screens are part of life — eye strain doesn't have to be. We diagnose digital eye strain and offer solutions from specialized lenses to habits that protect your vision at the desk.",
    icon: "monitor",
  },
  {
    slug: "sports-vision",
    title: "Sports Vision",
    short:
      "Sharper tracking, depth perception, and reaction time for athletes of every level.",
    long: "Vision is a trainable athletic skill. From protective eyewear to performance-focused vision care, we help athletes see the play before it happens.",
    icon: "activity",
  },
  {
    slug: "glaucoma",
    title: "Glaucoma Testing",
    short:
      "Early detection for the 'silent thief of sight' — pressure checks and screening built into your exam.",
    long: "Glaucoma often has no early symptoms, which is why routine testing matters. We screen for it as part of comprehensive exams and monitor patients who are at risk.",
    icon: "gauge",
  },
  {
    slug: "glasses",
    title: "Prescription Glasses & Frames",
    short:
      "Honest, personal frame styling with our optical team — eyewear you'll actually want to wear.",
    long: "Our optical specialists help you find frames that fit your face, your prescription, and your life — with adjustments and repairs handled in-house.",
    icon: "glasses",
  },
  {
    slug: "sunglasses",
    title: "Prescription & Non-Rx Sunglasses",
    short:
      "Real UV protection that matches your prescription — or just your style.",
    long: "Sun protection is eye protection. We carry prescription and non-prescription sunglasses so your eyes stay safe on the brightest days.",
    icon: "sun",
  },
];

export const team = [
  {
    name: "Dr. Nisha Mehta, OD",
    role: "Optometrist & Owner",
    bio: "Trained at Pennsylvania College of Optometry (2006), with a residency in eye disease at the Baltimore VA. Fellow of the American Academy of Optometry, former clinical assistant professor at UNC Chapel Hill, and holder of an MBA from East Carolina University. Dr. Mehta has also provided eye care on mission work in Guatemala.",
  },
  {
    name: "Crystal",
    role: "Practice Operations",
    bio: "Runs the daily operations of the practice and keeps every visit running smoothly.",
  },
  {
    name: "Katie",
    role: "Optometric Technician",
    bio: "Handles preliminary testing and contact lens training, so you start every exam prepared.",
  },
  {
    name: "Maddie",
    role: "Optical Specialist",
    bio: "Helps with frame selection, orders, and repairs — your guide through the optical.",
  },
  {
    name: "Amanda",
    role: "Front Desk & Scheduling",
    bio: "The friendly first face of the practice; keeps appointments and check-ins easy.",
  },
  {
    name: "Wendy",
    role: "Scheduling & Patient Questions",
    bio: "Answers patient questions and helps you find a time that works.",
  },
  {
    name: "Brianne",
    role: "Optical Specialist",
    bio: "Helps patients pick frames that fit their style, face, and prescription.",
  },
] as const;

export const doctorCredentials = [
  "Doctor of Optometry, Pennsylvania College of Optometry (2006)",
  "Residency in ocular disease, Baltimore VA Medical Center",
  "Fellow of the American Academy of Optometry",
  "Former clinical assistant professor, UNC Chapel Hill",
  "MBA, East Carolina University",
  "Eye care mission work in Guatemala",
] as const;

/* Placeholder testimonials — replace ALL of these with the practice's real
   Google / Facebook reviews before launch. Names and quotes are illustrative. */
export const testimonials = [
  {
    quote:
      "Dr. Mehta took real time with my exam and explained everything in plain English. First eye doctor I haven't felt rushed by.",
    name: "Sarah W.",
    detail: "Comprehensive exam",
  },
  {
    quote:
      "The whole team is wonderful — they helped my daughter get fitted for her first contacts and taught her everything patiently.",
    name: "Marcus T.",
    detail: "Contact lens fitting",
  },
  {
    quote:
      "My dry eye finally has a plan that works. I drive from Durham because the care here is worth it.",
    name: "Linda R.",
    detail: "Dry eye treatment",
  },
  {
    quote:
      "Picked out frames I actually love. No pressure, honest opinions, and they adjusted them perfectly before I left.",
    name: "Devon K.",
    detail: "Prescription glasses",
  },
  {
    quote:
      "They caught an early pressure change my old office missed and walked me through every next step. That kind of attention matters.",
    name: "Patricia H.",
    detail: "Glaucoma testing",
  },
  {
    quote:
      "Ortho-K changed my mornings — I see clearly all day without glasses. The fitting process was careful and thorough.",
    name: "Jason M.",
    detail: "Ortho-K contacts",
  },
  {
    quote:
      "Easy scheduling, zero wait, and the doctor remembered details from my visit a year ago. Small-town care done right.",
    name: "Emily C.",
    detail: "Annual exam",
  },
  {
    quote:
      "My son's sports goggles fit great and survived a whole soccer season. They knew exactly what he needed.",
    name: "Robert D.",
    detail: "Sports vision",
  },
  {
    quote:
      "Screens were wrecking my eyes by 3pm every day. Their computer vision plan actually fixed it.",
    name: "Aisha B.",
    detail: "Computer vision care",
  },
] as const;

export const stats = [
  { value: 5000, suffix: "+", label: "Eyes examined" },
  { value: 10, suffix: "+", label: "Years in Creedmoor" },
  { value: 4.9, decimals: 1, label: "Average star rating" },
  { value: 100, suffix: "%", label: "Independent & local" },
] as const;

export const nav = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Eyewear", href: "/eyewear" },
  { label: "Reviews", href: "/reviews" },
  { label: "Insurance", href: "/payments-insurance" },
  { label: "Contact", href: "/contact" },
] as const;
