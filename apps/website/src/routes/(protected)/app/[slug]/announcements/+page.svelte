<script lang="ts">
  import { Badge } from "@repo/ui/badge";
  import { Card } from "@repo/ui/card";

  import { formatDate } from "$lib/utils";

  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();

  // Mock announcements data
  const mockAnnouncements = $state([
    {
      id: "1",
      title: "Company Holiday Schedule 2025",
      content:
        "The holiday schedule for 2025 has been finalized. Key dates include: New Year's Day (Jan 1), Good Friday (Apr 7), Easter Monday (Apr 10), Labor Day (May 1), and Christmas Day (Dec 25). Please ensure all projects are planned around these dates. Additional information will be shared on the HR portal.",
      date: "2025-01-15",
      author: "HR Department",
      priority: "high",
      pinned: true,
      important: true,
    },
    {
      id: "2",
      title: "New Team Building Activity Scheduled",
      content:
        "We will host a team building event at the central office this month. This will include collaborative games, workshops, and networking opportunities. More details including agenda and RSVP instructions will be shared soon.",
      date: "2025-01-16",
      author: "Management",
      priority: "normal",
      pinned: false,
      important: false,
    },
    {
      id: "3",
      title: "System Maintenance Notice",
      content:
        "Due to scheduled maintenance, the company intranet will be down from 10 PM to 2 AM on Saturday, January 20th. All cloud services will remain available. Please complete any critical tasks before the downtime.",
      date: "2025-01-14",
      author: "IT Support",
      priority: "high",
      pinned: true,
      important: true,
    },
    {
      id: "4",
      title: "Quarterly Awards Nomination Period Open",
      content:
        "The nomination period for our quarterly awards program is now open. Submit your nominations for outstanding contributions before January 30th. Winners will be announced at the end-of-quarter meeting.",
      date: "2025-01-10",
      author: "Employee Recognition Committee",
      priority: "normal",
      pinned: false,
      important: false,
    },
    {
      id: "5",
      title: "Updated Remote Work Policy",
      content:
        "The company has updated its remote work policy following feedback from employees. The main changes include flexible start times, improved equipment stipends, and clearer expectations for communication. Review the full policy on the HR portal.",
      date: "2025-01-08",
      author: "HR Department",
      priority: "normal",
      pinned: false,
      important: true,
    },
  ]);

  const getPriorityClass = (priority: string, important: boolean) => {
    if (priority === "high" || important) {
      return "border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10";
    }
    return "border-l-4 border-gray-300 bg-white";
  };
</script>

<svelte:head>
  <title>{data.currentOrganization.name} | Announcements</title>
  <meta name="description" content="Company announcements and communications" />
</svelte:head>

<div class="container mx-auto space-y-6 p-4 md:p-6 lg:p-8">
  <div>
    <h1 class="text-2xl font-bold">Announcements</h1>
    <p class="text-gray-600 dark:text-gray-400">
      Stay updated with company news and important communications
    </p>
  </div>

  <!-- Important Announcements Section -->
  {#if mockAnnouncements.some((announcement) => announcement.important)}
    <Card class="p-6">
      <h2 class="mb-4 flex items-center gap-2 text-xl font-semibold">
        📢 Important Announcements
        <Badge class="bg-yellow-100 text-yellow-800">Priority</Badge>
      </h2>

      <div class="space-y-4">
        {#each mockAnnouncements.filter((a) => a.important) as announcement}
          <div class={getPriorityClass(announcement.priority, announcement.important)}>
            <div class="p-6">
              <div class="mb-3 flex items-start justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {announcement.title}
                </h3>
                {#if announcement.pinned}
                  <Badge class="bg-red-100 text-red-800">📌 Pinned</Badge>
                {/if}
              </div>

              <p class="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
                {announcement.content}
              </p>

              <div
                class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500"
              >
                <span>{announcement.author}</span>
                <span>{formatDate(new Date(announcement.date))}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </Card>
  {/if}

  <!-- All Announcements -->
  <Card class="p-6">
    <h2 class="mb-4 text-xl font-semibold">All Announcements</h2>

    <div class="space-y-4">
      {#each mockAnnouncements as announcement}
        <div class={getPriorityClass(announcement.priority, announcement.important)}>
          <div class="p-6">
            <div class="mb-3 flex items-start justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {announcement.title}
              </h3>
              <div class="flex gap-2">
                {#if announcement.pinned}
                  <Badge class="bg-red-100 text-red-800">📌 Pinned</Badge>
                {/if}
                {#if announcement.important}
                  <Badge class="bg-yellow-100 text-yellow-800">⚠️ Important</Badge>
                {/if}
              </div>
            </div>

            <p class="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
              {announcement.content}
            </p>

            <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
              <span>{announcement.author}</span>
              <span>{formatDate(new Date(announcement.date))}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>

    {#if mockAnnouncements.length === 0}
      <div class="py-8 text-center text-gray-500">
        <p>No announcements available at this time.</p>
      </div>
    {/if}
  </Card>
</div>

