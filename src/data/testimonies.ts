import { TestimonyCategory } from "@/components/TestimonyCard";

export type TestimonyStatus = "pending" | "approved" | "rejected";

export interface TestimonyData {
  id: string;
  title: string;
  snippet: string;
  fullStory: string;
  contributor: string;
  realName?: string;
  isAnonymous?: boolean;
  category: TestimonyCategory;
  mediaType?: "image" | "video" | "audio" | "pdf";
  mediaThumbnail?: string;
  views: number;
  createdAt: Date;
  status: TestimonyStatus;
  rejectionNote?: string;
}

export const testimoniesData: TestimonyData[] = [
  {
    id: "1",
    title: "Miraculous Recovery from Cancer",
    snippet: "After being diagnosed with stage 3 cancer, I was given only months to live. But through prayer and faith, I received complete healing.",
    fullStory: "After being diagnosed with stage 3 cancer, I was given only months to live. The doctors had done all they could, and my family was preparing for the worst. But our church community rallied around us, holding prayer vigils and supporting us through every treatment. One morning, I woke up feeling different – stronger. When the next round of tests came back, the doctors were stunned. The tumor had shrunk significantly. Within six months, I was declared cancer-free. I know this was nothing short of a miracle from God.",
    contributor: "Sarah M.",
    realName: "Sarah Mitchell",
    isAnonymous: false,
    category: "Healing",
    mediaType: "image",
    views: 342,
    createdAt: new Date("2024-01-15"),
    status: "approved",
  },
  {
    id: "2",
    title: "God Provided When All Seemed Lost",
    snippet: "Facing eviction and with no income, I trusted God's provision. Within a week, unexpected blessings arrived that saved my family.",
    fullStory: "I lost my job during the economic downturn, and with three children to feed, every day was a struggle. We were three months behind on rent, and the eviction notice had arrived. I remember falling to my knees, crying out to God. That same week, a stranger from church approached me about a job opening. Not only did I get the position, but someone anonymously paid our back rent. I still don't know who it was, but I know God orchestrated every detail.",
    contributor: "Michael T.",
    realName: "Michael Thompson",
    isAnonymous: false,
    category: "Provision",
    views: 256,
    createdAt: new Date("2024-01-20"),
    status: "approved",
  },
  {
    id: "3",
    title: "Breaking Free from Addiction",
    snippet: "For 15 years, I was bound by alcohol addiction. Through God's power and my church family, I found true freedom.",
    fullStory: "Alcohol controlled my life for 15 years. I lost jobs, relationships, and nearly my life. Rock bottom came when I woke up in a hospital after a near-fatal accident. A chaplain visited me and shared the gospel. For the first time, I felt hope. I joined a faith-based recovery program at my local church, and with their support and God's strength, I've been sober for three years now. Every day I wake up grateful for this second chance.",
    contributor: "Anonymous",
    realName: "James Walker",
    isAnonymous: true,
    category: "Deliverance",
    mediaType: "video",
    views: 489,
    createdAt: new Date("2024-02-01"),
    status: "approved",
  },
  {
    id: "4",
    title: "Restored Marriage After 10 Years",
    snippet: "When my spouse walked out, I thought our marriage was over. God intervened and brought complete restoration.",
    fullStory: "After 10 years of marriage, my spouse walked out. The pain was unbearable, and I didn't know how to face each day. But I committed to prayer and trusting God's plan. Our church's marriage counseling program helped me work through my own issues. After two years of separation, my spouse returned. We both had changed, and our relationship is now stronger than ever. God truly can restore what seems broken beyond repair.",
    contributor: "David & Lisa R.",
    realName: "David & Lisa Rodriguez",
    isAnonymous: false,
    category: "Breakthrough",
    views: 312,
    createdAt: new Date("2024-02-10"),
    status: "approved",
  },
  {
    id: "5",
    title: "Child Healed from Chronic Illness",
    snippet: "Our daughter suffered from a chronic condition since birth. After years of prayer, she was miraculously healed.",
    fullStory: "Our daughter was born with a chronic autoimmune condition that required daily medication and frequent hospital visits. We prayed constantly for her healing. During a church service, the pastor felt led to pray specifically for children with chronic illnesses. That week, our daughter's symptoms began to improve. Her doctor was amazed – her bloodwork showed no signs of the condition. She's been medication-free for over a year now.",
    contributor: "The Johnson Family",
    realName: "The Johnson Family",
    isAnonymous: false,
    category: "Healing",
    mediaType: "image",
    views: 428,
    createdAt: new Date("2024-02-15"),
    status: "approved",
  },
  {
    id: "6",
    title: "Unexpected Scholarship Blessing",
    snippet: "With no money for college, I prayed for a way. God opened doors I never knew existed and provided full funding.",
    fullStory: "I had been accepted to my dream university, but there was no way my family could afford the tuition. I prayed and applied for every scholarship I could find. Just weeks before the deadline, I received a call about a scholarship I didn't remember applying for – it covered my full tuition. The administrator said my application had been 'found' in a pile that was supposed to be discarded. I believe God's hand was in every moment.",
    contributor: "FFI N.",
    realName: "FFI Nwosu",
    isAnonymous: false,
    category: "Provision",
    mediaType: "audio",
    views: 178,
    createdAt: new Date("2024-03-01"),
    status: "approved",
  },
  // Pending testimonies
  {
    id: "7",
    title: "Healed from Chronic Back Pain",
    snippet: "For 8 years I could barely walk. After a prayer session, the pain vanished completely.",
    fullStory: "For eight years, chronic back pain dominated my life. I tried every treatment — physical therapy, medication, even surgery — but nothing worked. During a special healing service, the elder prayed over me and I felt warmth spreading through my spine. I stood up straight for the first time in years. My orthopedic surgeon confirmed the improvement was medically unexplainable. God is faithful!",
    contributor: "Anonymous",
    realName: "Peter Okafor",
    isAnonymous: true,
    category: "Healing",
    views: 0,
    createdAt: new Date("2024-03-10"),
    status: "pending",
  },
  {
    id: "8",
    title: "Business Breakthrough Against All Odds",
    snippet: "My business was failing and debts were mounting. God turned everything around in just three months.",
    fullStory: "My small business was on the verge of collapse. Suppliers were cutting me off, and I owed more than I could ever repay. I fasted and prayed for 21 days, surrendering the business to God. Within three months, a new client came in with a contract that covered all my debts and gave me a fresh start. Today, the business is thriving and I employ 15 people. Only God could have done this.",
    contributor: "Emmanuel K.",
    realName: "Emmanuel Kofi",
    isAnonymous: false,
    category: "Breakthrough",
    mediaType: "pdf",
    views: 0,
    createdAt: new Date("2024-03-12"),
    status: "pending",
  },
  {
    id: "9",
    title: "Delivered from Night Terrors",
    snippet: "Every night was a battle with terrifying dreams. Through prayer and deliverance, I now sleep in peace.",
    fullStory: "For two years, I experienced horrifying nightmares every single night. I was afraid to sleep and my health deteriorated. Medical doctors found nothing wrong. My pastor organized a deliverance prayer session, and from that very night, the nightmares stopped completely. I now sleep peacefully and wake up refreshed. The power of God is real and active today.",
    contributor: "Anonymous",
    realName: "Ruth Mensah",
    isAnonymous: true,
    category: "Deliverance",
    views: 0,
    createdAt: new Date("2024-03-15"),
    status: "pending",
  },
  // Rejected testimony
  {
    id: "10",
    title: "Won the Lottery",
    snippet: "I prayed and won the lottery the next day.",
    fullStory: "I bought a lottery ticket and prayed that I would win. The next day I checked the numbers and I had won! God answers prayer!",
    contributor: "Lucky L.",
    realName: "Lucky Larson",
    isAnonymous: false,
    category: "Provision",
    views: 0,
    createdAt: new Date("2024-03-08"),
    status: "rejected",
    rejectionNote: "Testimony does not align with church values. Gambling is not endorsed as a testimony of God's provision.",
  },
];
