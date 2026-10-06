import type { Messages } from './id'

const en: Messages = {
  nav: {
    fitur: 'Features',
    harga: 'Pricing',
    testimoni: 'Testimonials',
    register: 'Register',
    tentang: 'About',
    faq: 'FAQ',
    gantiBahasa: 'Ganti ke Bahasa Indonesia',
    modeGelap: 'Switch to dark mode',
    modeTerang: 'Switch to light mode',
  },
  hero: {
    tagline: 'The simple boilerplate for your business apps.',
    deskripsi: 'All-in-one digital skeleton solution for Indonesian UMKM. Manage users, roles, permissions, merchants, and uploads in one easy-to-use platform.',
    masuk: 'Login',
    daftar: 'Register',
    stats: {
      pengguna: 'Active Users',
      transaksi: 'Permissions',
      outlet: 'Merchants',
      tahun: 'Experience',
    },
    kepercayaan: 'Trusted by thousands of developers and merchants across Indonesia',
  },
  features: {
    title: 'Key Features',
    subtitle: 'Everything you need to manage your business skeleton.',
    items: [
      { title: 'User Management', description: 'Real-time user tracking and management.' },
      { title: 'Role Management', description: 'Assign roles to control access and actions.' },
      { title: 'Permission Management', description: 'Easily manage granular permissions.' },
      { title: 'Merchant Management', description: 'Manage merchant details and metadata.' },
      { title: 'Upload Management', description: 'S3-compatible secure file uploads.' },
      { title: 'Notification System', description: 'In-app notification system.' },
    ],
  },
  pricing: {
    populer: 'Popular',
    title: 'Pricing Plans',
    subtitle: 'Choose the plan that fits your business needs.',
    plans: [
      {
        name: 'Free',
        price: 'Rp 0',
        period: '/month',
        features: ['Up to 5 users', '1 merchant', 'Basic features', 'Email support'],
        cta: 'Get Started',
        featured: false,
      },
      {
        name: 'Business',
        price: 'Rp 99,000',
        period: '/month',
        features: ['Unlimited users', 'Up to 3 merchants', 'All features', 'Priority support', 'Data export'],
        cta: 'Start Trial',
        featured: true,
      },
      {
        name: 'Enterprise',
        price: 'Rp 299,000',
        period: '/month',
        features: ['Unlimited users', 'Unlimited merchants', 'Customized solutions', '24/7 support', 'API access', 'Dedicated account'],
        cta: 'Contact Us',
        featured: false,
      },
    ],
  },
  testimonials: {
    title: 'What Customers Say',
    subtitle: 'Join thousands of businesses already using GH Skeleton.',
    items: [
      { quote: 'GH Skeleton helps me build business dashboards extremely fast. The boilerplate is so clean!', name: 'Rian Prasetyo', role: 'Software Engineer' },
      { quote: 'I used to struggle setting up RBAC. Now it is already configured out-of-the-box!', name: 'Budi Santoso', role: 'Tech Lead' },
      { quote: 'The merchant structures are very clean and easy to customize for our SaaS project.', name: 'Dewi Lestari', role: 'SaaS Founder' },
    ],
  },
  register: {
    kicker: 'Create New Account',
    title: 'Start Using GH Skeleton',
    subtitle: 'Fill in the form below to create a new merchant account.',
    fields: {
      name: 'Full Name',
      email: 'Email',
      password: 'Password',
      merchantName: 'Merchant Name',
      merchantSlug: 'Merchant Slug',
    },
    actions: {
      submit: 'Register Now',
      loading: 'Processing...',
    },
    messages: {
      success: 'Registration successful. Please continue login in the web app.',
      failed: 'Registration failed. Please try again.',
    },
  },
  footer: {
    hakCipta: 'GH Skeleton Project. All rights reserved.',
    tautan: {
      tentang: 'About',
      faq: 'FAQ',
      syarat: 'Terms & Conditions',
    },
  },
  meta: {
    situs: 'GH Skeleton',
    beranda: {
      title: 'GH Skeleton — The boilerplate for business apps',
      description: 'A multi-tenant SaaS skeleton: users, roles, permissions, merchants, uploads, and notifications in one platform.',
    },
  },
  about: {
    title: 'About GH Skeleton',
    subtitle: 'A starting point for building multi-tenant business applications.',
    misi: {
      title: 'Why we built it',
      paragraf: [
        'Almost every business application starts with the same work: login, users, roles, permissions, and keeping each customer\'s data separate. That work matters, but it is not what sets your product apart.',
        'GH Skeleton ships that foundation ready to use, so your team can go straight to the features that matter to your users.',
      ],
    },
    nilai: {
      title: 'Our principles',
      items: [
        { title: 'Simple', description: 'A structure that is easy to read and easy to change, with no unnecessary layers.' },
        { title: 'Secure from the start', description: 'Each merchant\'s data is isolated, and every action is permission-checked on the server.' },
        { title: 'Ready to extend', description: 'Add your own business modules by following the existing patterns.' },
      ],
    },
  },
  faq: {
    title: 'Frequently Asked Questions',
    subtitle: 'Short answers to the questions we hear most.',
    items: [
      { question: 'What is GH Skeleton?', answer: 'GH Skeleton is a multi-tenant SaaS application skeleton. It includes authentication, merchant and user management, roles and permissions, file uploads, notifications, and account settings.' },
      { question: 'Is data separated between merchants?', answer: 'Yes. Every user belongs to one merchant, and every data request is limited to the merchant of the signed-in user.' },
      { question: 'How is access controlled?', answer: 'Access is controlled through roles and permissions. A user can hold several roles, and their effective permissions are the union of all of them.' },
      { question: 'How do I get started?', answer: 'Fill in the registration form on the home page. A merchant account and its owner user are created together, and you can then sign in through the web app.' },
      { question: 'Where are uploaded files stored?', answer: 'Files can be stored on local disk for development or on an S3-compatible service for production.' },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    subtitle: 'The terms for using the GH Skeleton service.',
    draf: 'Draft',
    tidakAda: 'This document is not available yet.',
  },
}

export default en
