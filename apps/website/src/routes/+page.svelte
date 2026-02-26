<script lang="ts">
  import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
  import BarChart3Icon from "@lucide/svelte/icons/bar-chart-3";
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import ClockIcon from "@lucide/svelte/icons/clock";
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import UsersIcon from "@lucide/svelte/icons/users";
  import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
  import { Badge } from "@repo/ui/badge";
  import { Button } from "@repo/ui/button";
  import * as Card from "@repo/ui/card";
  import { Separator } from "@repo/ui/separator";

  const features = [
    {
      icon: ClockIcon,
      title: "Smart Attendance Tracking",
      description:
        "Real-time check-in/out with GPS location, automated schedules, and instant notifications.",
      badge: "Real-time",
    },
    {
      icon: CalendarIcon,
      title: "Leave Management",
      description:
        "Streamlined leave requests, automatic balance tracking, and manager approvals in one place.",
      badge: "Automated",
    },
    {
      icon: UsersIcon,
      title: "Team Calendars",
      description:
        "Shared calendars for team events, holidays, and shift scheduling with conflict detection.",
      badge: "Collaborative",
    },
    {
      icon: BarChart3Icon,
      title: "Analytics Dashboard",
      description:
        "Comprehensive reports on attendance patterns, leave usage, and team productivity insights.",
      badge: "Insights",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Organization",
      description:
        "Sign up and set up your company profile in minutes. Add your company details and branding.",
    },
    {
      number: "02",
      title: "Invite Your Team",
      description:
        "Send invitations to your team members via email. They can join and set up their profiles.",
    },
    {
      number: "03",
      title: "Start Tracking",
      description:
        "Enable attendance policies and let your team start checking in. Monitor everything from your dashboard.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "HR Manager",
      company: "TechFlow Inc.",
      avatar: "SC",
      quote:
        "Gakom transformed how we manage attendance. No more spreadsheets or confused leave requests.",
    },
    {
      name: "Marcus Johnson",
      role: "Operations Lead",
      company: "GrowthLabs",
      avatar: "MJ",
      quote:
        "The team calendar feature alone saved us hours of coordination every week. Highly recommended.",
    },
    {
      name: "Emily Rodriguez",
      role: "Founder",
      company: "StartupXYZ",
      avatar: "ER",
      quote:
        "Finally, an HR tool that actually works. Setup was seamless and our team adopted it instantly.",
    },
  ];
</script>

<svelte:head>
  <title>Gakom - Smart HR Management for Modern Teams</title>
  <meta
    name="description"
    content="Streamline attendance, leave management, and team scheduling in one platform."
  />
</svelte:head>

<div class="bg-background min-h-screen">
  <!-- Header -->
  <header
    class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
  >
    <div class="container mx-auto flex h-16 items-center justify-between px-4">
      <div class="flex items-center gap-2">
        <div class="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
          <span class="text-primary-foreground text-lg font-bold">G</span>
        </div>
        <span class="text-xl font-semibold">Gakom</span>
      </div>

      <nav class="hidden items-center gap-8 md:flex">
        <a
          href="#features"
          class="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >Features</a
        >
        <a
          href="#how-it-works"
          class="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >How It Works</a
        >
        <a
          href="#testimonials"
          class="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >Testimonials</a
        >
      </nav>

      <div class="flex items-center gap-3">
        <Button variant="ghost" href="/signin">Sign In</Button>
        <Button href="/signup">Get Started</Button>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative overflow-hidden py-20 md:py-32">
    <div class="container mx-auto px-4">
      <div class="mx-auto max-w-4xl text-center">
        <Badge variant="secondary" class="mb-6">
          <SparklesIcon class="mr-1 h-3 w-3" />
          Now with AI-powered insights
        </Badge>

        <h1 class="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          Smart HR Management for <span class="text-primary">Modern Teams</span>
        </h1>

        <p class="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg md:text-xl">
          Streamline attendance, leave management, and team scheduling in one powerful platform.
          Save time and focus on what matters.
        </p>

        <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" href="/signup" class="gap-2">
            Start Free Trial
            <ArrowRightIcon class="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" href="#how-it-works">Watch Demo</Button>
        </div>

        <p class="text-muted-foreground mt-6 text-sm">
          No credit card required • 14-day free trial
        </p>
      </div>

      <!-- Mock Dashboard Preview -->
      <div class="mx-auto mt-16 max-w-5xl">
        <div class="bg-card relative rounded-xl border shadow-2xl">
          <div class="flex items-center gap-2 border-b p-4">
            <div class="h-3 w-3 rounded-full bg-red-500"></div>
            <div class="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div class="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <div class="space-y-6 p-6">
            <div class="grid gap-4 md:grid-cols-4">
              {#each [{ label: "Total Members", value: "24" }, { label: "Present Today", value: "18" }, { label: "On Leave", value: "3" }, { label: "Late Arrivals", value: "2" }] as stat}
                <div class="bg-card rounded-lg border p-4">
                  <p class="text-muted-foreground text-sm">{stat.label}</p>
                  <p class="text-2xl font-bold">{stat.value}</p>
                </div>
              {/each}
            </div>
            <div
              class="bg-card flex min-h-[200px] items-center justify-center rounded-lg border p-4"
            >
              <p class="text-muted-foreground">Dashboard Preview</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <Separator />

  <!-- Features Section -->
  <section id="features" class="py-20 md:py-28">
    <div class="container mx-auto px-4">
      <div class="mx-auto mb-16 max-w-2xl text-center">
        <h2 class="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
          Everything you need to manage your team
        </h2>
        <p class="text-muted-foreground text-lg">
          Powerful features designed to simplify HR operations and improve team productivity.
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {#each features as feature}
          <Card.Root>
            <Card.Header>
              <div
                class="bg-primary/10 mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg"
              >
                <feature.icon class="text-primary h-5 w-5" />
              </div>
              <div class="flex items-center justify-between">
                <Card.Title class="text-lg">{feature.title}</Card.Title>
                <Badge variant="outline" class="text-xs">{feature.badge}</Badge>
              </div>
            </Card.Header>
            <Card.Content>
              <p class="text-muted-foreground text-sm">{feature.description}</p>
            </Card.Content>
          </Card.Root>
        {/each}
      </div>
    </div>
  </section>

  <Separator />

  <!-- How It Works Section -->
  <section id="how-it-works" class="bg-muted/30 py-20 md:py-28">
    <div class="container mx-auto px-4">
      <div class="mx-auto mb-16 max-w-2xl text-center">
        <h2 class="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Get started in minutes</h2>
        <p class="text-muted-foreground text-lg">
          Three simple steps to transform your HR management.
        </p>
      </div>

      <div class="grid gap-8 md:grid-cols-3">
        {#each steps as step, i}
          <div class="relative">
            {#if i < steps.length - 1}
              <div
                class="bg-border absolute top-8 right-[calc(-50%+40px)] left-[calc(50%+40px)] hidden h-px md:block"
              ></div>
            {/if}
            <div class="flex flex-col items-center text-center">
              <div
                class="bg-primary text-primary-foreground mb-4 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold"
              >
                {step.number}
              </div>
              <h3 class="mb-2 text-xl font-semibold">{step.title}</h3>
              <p class="text-muted-foreground">{step.description}</p>
            </div>
          </div>
        {/each}
      </div>

      <div class="mt-12 text-center">
        <Button size="lg" href="/signup" class="gap-2">
          Start Your Free Trial
          <ArrowRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </section>

  <Separator />

  <!-- Testimonials Section -->
  <section id="testimonials" class="py-20 md:py-28">
    <div class="container mx-auto px-4">
      <div class="mx-auto mb-16 max-w-2xl text-center">
        <h2 class="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
          Loved by teams everywhere
        </h2>
        <p class="text-muted-foreground text-lg">See what our customers have to say about Gakom.</p>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        {#each testimonials as testimonial}
          <Card.Root>
            <Card.Content class="pt-6">
              <div class="mb-4 flex items-center gap-1">
                {#each Array(5) as _}
                  <svg class="fill-primary text-primary h-4 w-4" viewBox="0 0 20 20">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                {/each}
              </div>
              <p class="text-muted-foreground mb-6">"{testimonial.quote}"</p>
              <div class="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="" alt={testimonial.name} />
                  <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p class="font-medium">{testimonial.name}</p>
                  <p class="text-muted-foreground text-sm">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </Card.Content>
          </Card.Root>
        {/each}
      </div>
    </div>
  </section>

  <Separator />

  <!-- CTA Section -->
  <section class="bg-primary text-primary-foreground py-20 md:py-28">
    <div class="container mx-auto px-4 text-center">
      <h2 class="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
        Ready to streamline your HR?
      </h2>
      <p class="text-primary-foreground/80 mx-auto mb-8 max-w-xl text-lg">
        Join thousands of teams already using Gakom to simplify their HR operations.
      </p>
      <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button size="lg" variant="secondary" href="/signup" class="gap-2">
          Start Your Free Trial
          <ArrowRightIcon class="h-4 w-4" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          href="/signin"
          class="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
        >
          Sign In
        </Button>
      </div>
      <p class="text-primary-foreground/70 mt-6 text-sm">
        No credit card required • Cancel anytime
      </p>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t py-12">
    <div class="container mx-auto px-4">
      <div class="grid gap-8 md:grid-cols-4">
        <div>
          <div class="mb-4 flex items-center gap-2">
            <div class="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <span class="text-primary-foreground text-lg font-bold">G</span>
            </div>
            <span class="text-xl font-semibold">Gakom</span>
          </div>
          <p class="text-muted-foreground text-sm">
            Smart HR management for modern teams. Simplify attendance, leave, and scheduling.
          </p>
        </div>

        <div>
          <h4 class="mb-4 font-medium">Product</h4>
          <ul class="text-muted-foreground space-y-2 text-sm">
            <li>
              <a href="#features" class="hover:text-foreground transition-colors">Features</a>
            </li>
            <li><a href="#pricing" class="hover:text-foreground transition-colors">Pricing</a></li>
            <li><a href="#" class="hover:text-foreground transition-colors">Integrations</a></li>
          </ul>
        </div>

        <div>
          <h4 class="mb-4 font-medium">Company</h4>
          <ul class="text-muted-foreground space-y-2 text-sm">
            <li><a href="#" class="hover:text-foreground transition-colors">About</a></li>
            <li><a href="#" class="hover:text-foreground transition-colors">Blog</a></li>
            <li><a href="#" class="hover:text-foreground transition-colors">Careers</a></li>
          </ul>
        </div>

        <div>
          <h4 class="mb-4 font-medium">Legal</h4>
          <ul class="text-muted-foreground space-y-2 text-sm">
            <li><a href="#" class="hover:text-foreground transition-colors">Privacy Policy</a></li>
            <li>
              <a href="#" class="hover:text-foreground transition-colors">Terms of Service</a>
            </li>
            <li><a href="#" class="hover:text-foreground transition-colors">Cookie Policy</a></li>
          </ul>
        </div>
      </div>

      <Separator class="my-8" />

      <p class="text-muted-foreground text-center text-sm">
        &copy; {new Date().getFullYear()} Gakom. All rights reserved.
      </p>
    </div>
  </footer>
</div>
