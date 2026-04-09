import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  PieChart,
  Wallet,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const features = [
  {
    icon: Wallet,
    title: 'Учёт счетов',
    description: 'Управляйте всеми банковскими счетами, картами и наличными в одном месте',
  },
  {
    icon: BarChart3,
    title: 'Аналитика расходов',
    description: 'Детальные отчёты по категориям с интерактивными графиками и диаграммами',
  },
  {
    icon: PieChart,
    title: 'Бюджеты',
    description: 'Создавайте бюджеты по категориям и следите за их выполнением в реальном времени',
  },
  {
    icon: TrendingUp,
    title: 'Финансовые отчёты',
    description: 'Анализ денежного потока, тренды доходов и расходов за любой период',
  },
  {
    icon: Shield,
    title: 'Безопасность',
    description: 'Надёжная аутентификация и защита ваших финансовых данных',
  },
  {
    icon: Zap,
    title: 'Курсы валют',
    description: 'Актуальные курсы валют ЦБ РФ для мультивалютного учёта',
  },
];

const steps = [
  { num: '01', title: 'Создайте аккаунт', description: 'Быстрая регистрация за 30 секунд' },
  { num: '02', title: 'Добавьте счета', description: 'Внесите ваши банковские счета и кошельки' },
  { num: '03', title: 'Записывайте операции', description: 'Фиксируйте доходы и расходы по категориям' },
  { num: '04', title: 'Анализируйте', description: 'Получайте инсайты и управляйте бюджетом' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Управление личными финансами"
        description="Finona — бесплатное приложение для учёта личных финансов. Контролируйте расходы, создавайте бюджеты, анализируйте денежные потоки с интерактивными отчётами."
        path="/landing"
      />

      <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/landing" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
              <span className="text-lg font-bold text-primary-foreground">₽</span>
            </div>
            <span className="text-xl font-bold">Finona</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Возможности
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Как это работает
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Войти</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Начать бесплатно</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(203_89%_25%/0.08),transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Бесплатно и без ограничений
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Ваши финансы{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              под контролем
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Учитывайте доходы и расходы, планируйте бюджет и анализируйте денежные потоки
            с помощью наглядных графиков и отчётов
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link to="/auth">
                Начать бесплатно
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <a href="#features">Узнать больше</a>
            </Button>
          </div>

          <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-xl border shadow-lg">
            <div className="bg-gradient-to-b from-muted/50 to-background p-1">
              <div className="rounded-lg bg-card p-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Баланс', value: '₽ 847 230', color: 'text-foreground' },
                    { label: 'Доходы за месяц', value: '+ ₽ 185 000', color: 'text-success' },
                    { label: 'Расходы за месяц', value: '- ₽ 92 450', color: 'text-destructive' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-muted/50 p-4 text-center">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className={`mt-1 text-lg font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-end gap-1">
                  {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-primary/20"
                      style={{ height: `${h}px` }}
                    >
                      <div
                        className="w-full rounded-t bg-primary transition-all"
                        style={{ height: `${h * 0.7}px`, marginTop: `${h * 0.3}px` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Всё для управления финансами</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Полный набор инструментов для контроля и анализа ваших денежных потоков
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:border-primary/20"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 border-y bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Начните за 4 простых шага</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              От регистрации до полного контроля финансов — за пару минут
            </p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {step.num}
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Почему Finona?</h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Полностью бесплатно',
              'Без рекламы',
              'Работает на любом устройстве',
              'Наглядные графики и отчёты',
              'Мультивалютный учёт',
              'Экспорт данных в CSV',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Готовы взять финансы под контроль?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Присоединяйтесь к Finona — начните учёт уже сегодня, это бесплатно
          </p>
          <Button size="lg" className="mt-8 h-12 px-10 text-base" asChild>
            <Link to="/auth">
              Создать аккаунт
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary">
              <span className="text-sm font-bold text-primary-foreground">₽</span>
            </div>
            <span className="font-semibold">Finona</span>
          </div>
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Finona. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
