<script lang="ts">
  import type { PageProps } from "./$types";
  import { Card } from "@repo/ui/card";
  import { Badge } from "@repo/ui/badge";
  import { Toggle } from "@repo/ui/toggle";

  const { data }: PageProps = $props();

  // Mock tasks data
  const mockTasks = $state([
    {
      id: '1',
      title: 'Complete quarterly report',
      description: 'Compile Q4 sales data and prepare presentation for management',
      status: 'in_progress' as 'pending' | 'in_progress' | 'done',
      dueDate: '2025-01-20',
      assignedBy: 'Manager',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Review team performance',
      description: 'Conduct individual performance reviews for team members',
      status: 'pending' as 'pending' | 'in_progress' | 'done',
      dueDate: '2025-01-22',
      assignedBy: 'Supervisor',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Update project documentation',
      description: 'Update API documentation and user guides',
      status: 'done' as 'pending' | 'in_progress' | 'done',
      dueDate: '2025-01-18',
      assignedBy: 'Manager',
      priority: 'low'
    },
    {
      id: '4',
      title: 'Prepare monthly budget report',
      description: 'Analyze expenses and create budget variance report',
      status: 'pending' as 'pending' | 'in_progress' | 'done',
      dueDate: '2025-01-25',
      assignedBy: 'Finance',
      priority: 'high'
    }
  ]);

  const updateTaskStatus = (id: string, newStatus: 'pending' | 'in_progress' | 'done') => {
    const task = mockTasks.find(t => t.id === id);
    if (task) {
      task.status = newStatus;
    }
  };

  const getStatusBadgeClass = (status: 'pending' | 'in_progress' | 'done') => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-500';
    }
  };

  // Filter options
  const statusFilters = $state(['pending', 'in_progress', 'done'] as const);
  const filteredTasks = $derived(mockTasks.filter(task => statusFilters.includes(task.status)));
</script>

<svelte:head>
  <title>{data.currentOrganization.name} | Tasks</title>
  <meta name="description" content="Personal task tracking and management" />
</svelte:head>

<div class="container mx-auto space-y-6 p-4 md:p-6 lg:p-8">
  <div>
    <h1 class="text-2xl font-bold">Tasks</h1>
    <p class="text-gray-600 dark:text-gray-400">Track your personal tasks and deadlines</p>
  </div>

  <!-- Filter Toggle -->
  <Card class="p-6">
    <h2 class="text-lg font-semibold mb-4">Show Tasks:</h2>
    <div class="flex flex-wrap gap-4">
      {#each ['pending', 'in_progress', 'done'] as status}
        <label class="flex items-center space-x-2">
          <Toggle
            checked={statusFilters.includes(status)}
            onchange={(e) => {
              const isChecked = e.target.checked;
              if (isChecked) {
                statusFilters.splice(0, statusFilters.length, ...statusFilters, status);
              } else {
                const index = statusFilters.indexOf(status);
                if (index > -1) statusFilters.splice(index, 1);
              }
              statusFilters.length = [...statusFilters];
            }}
          >
            {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
          </Toggle>
        </label>
      {/each}
    </div>
  </Card>

  <!-- Task List -->
  <div class="space-y-4">
    {#each filteredTasks as task}
      <Card class="p-6 {getPriorityColor(task.priority)} rounded-lg">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-4 mb-2">
              <h3 class="text-lg font-semibold">{task.title}</h3>
              <Badge class={getStatusBadgeClass(task.status)}>
                {task.status === 'in_progress' ? 'In Progress' : task.status === 'done' ? 'Done' : 'Pending'}
              </Badge>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
            <div class="flex flex-wrap gap-4 text-sm">
              <span class="text-gray-500">Due: {task.dueDate}</span>
              <span class="text-gray-500">Assigned by: {task.assignedBy}</span>
            </div>
          </div>

          <!-- Status Toggle Buttons -->
          <div class="flex gap-2 ml-4">
            <button
              class="px-3 py-1 text-sm rounded border {task.status === 'pending' ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'}"
              onclick={() => updateTaskStatus(task.id, 'pending')}
            >
              Pending
            </button>
            <button
              class="px-3 py-1 text-sm rounded border {task.status === 'in_progress' ? 'bg-yellow-100 border-yellow-300' : 'bg-white border-gray-200'}"
              onclick={() => updateTaskStatus(task.id, 'in_progress')}
            >
              In Progress
            </button>
            <button
              class="px-3 py-1 text-sm rounded border {task.status === 'done' ? 'bg-green-100 border-green-300' : 'bg-white border-gray-200'}"
              onclick={() => updateTaskStatus(task.id, 'done')}
            >
              Done
            </button>
          </div>
        </div>
      </Card>
    {/each}

    {#if filteredTasks.length === 0}
      <Card class="p-8 text-center">
        <p class="text-gray-500">No tasks match the selected filters.</p>
      </Card>
    {/if}
  </div>
</div>