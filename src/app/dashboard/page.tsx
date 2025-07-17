import { Contact, ListTodo, MailOpen, LineChart, PencilRuler } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const dashboardOptions = [
  {
    title: 'Contact',
    icon: <Contact className="w-8 h-8 text-[#ff6600]" />, // orange accent
    description: 'Manage your contacts and keep your audience up to date.',
    href: '#',
  },
  {
    title: 'Lists',
    icon: <ListTodo className="w-8 h-8 text-[#ff6600]" />, // orange accent
    description: 'Organize your contacts into targeted lists for campaigns.',
    href: '#',
  },
  {
    title: 'Campaign',
    icon: <MailOpen className="w-8 h-8 text-[#ff6600]" />, // orange accent
    description: 'Create and send engaging email campaigns to your audience.',
    href: '#',
  },
  {
    title: 'Tracking',
    icon: <LineChart className="w-8 h-8 text-[#ff6600]" />, // orange accent
    description: 'Track campaign performance and audience engagement.',
    href: '#',
  },
  {
    title: 'Email Builder',
    icon: <PencilRuler className="w-8 h-8 text-[#ff6600]" />, // orange accent
    description: 'Design beautiful emails with our drag-and-drop builder.',
    href: '/email-builder',
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#fdf6f1] flex flex-col items-center py-16 px-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-[#232323] mb-3 sm:mb-4 drop-shadow-sm leading-tight px-2 sm:px-0">
       Welcome to Mortdash Marketing
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-[#232323] text-center mb-6 sm:mb-8 max-w-xl sm:max-w-2xl font-medium px-2 sm:px-0">
        Build Targeted Marketing Lists, Launch Effective Campaigns, and Track Performance
      </p>
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {dashboardOptions.map((option) => (
          <a
            key={option.title}
            href={option.href}
            className="group"
          >
            <Card className="h-full transition-all border border-[#ffe3d1] hover:border-[#ff6600] shadow-lg hover:shadow-xl rounded-2xl flex flex-col items-center justify-center bg-white">
              <CardHeader className="flex flex-col items-center gap-2 pb-0">
                <div className="mb-2">{option.icon}</div>
                <CardTitle className="text-2xl font-bold text-center text-[#232323] group-hover:underline underline-offset-4">{option.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-[#6d6d6d] text-center text-base pb-6 pt-2">
                {option.description}
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </main>
  );
}
