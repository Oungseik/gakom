<script lang="ts" module>
  export type Member = {
    id: string;
    name: string;
    email: string;
    role: "owner" | "admin" | "member";
  };
</script>
