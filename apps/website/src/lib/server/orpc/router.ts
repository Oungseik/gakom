import { createRouterClient } from "@orpc/server";

import { os } from "./base";
import { healthCheckHandler } from "./handlers/health/health_check";
import { removeImageHandler } from "./handlers/images/remove_image";
import { uploadImageHandler } from "./handlers/images/upload_image";
import { countAttendancePoliciesHandler } from "./handlers/organizations/countAttendancePolicies";
import { listAttendancePoliciesHandler } from "./handlers/organizations/listAttendancePolicies";
import { listInvitationsHandler } from "./handlers/organizations/listInvitations";
import { listMembersHandler } from "./handlers/organizations/listMembers";
import { updateMemberHandler } from "./handlers/organizations/updateMember";

export const router = os.router({
  health: { check: healthCheckHandler },
  images: {
    remove: removeImageHandler,
    upload: uploadImageHandler,
  },
  organizations: {
    attendances: {},
    attendancesPolicies: {
      count: countAttendancePoliciesHandler,
      list: listAttendancePoliciesHandler,
    },
    members: { list: listMembersHandler, update: updateMemberHandler },
    invitations: { list: listInvitationsHandler },
  },
});

/** only for server-side call */
export const client = createRouterClient(router);

export type Router = typeof router;
