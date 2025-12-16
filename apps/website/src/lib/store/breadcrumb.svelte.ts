class Breadcrumb {
  private state: { href: string; desc: string }[] = $state([
    { desc: "Dashboard", href: "/app/dashboard" },
  ]);

  get value() {
    return this.state;
  }

  set value(state: { href: string; desc: string }[]) {
    this.state = state;
  }
}

export const breadcrumb = new Breadcrumb();
