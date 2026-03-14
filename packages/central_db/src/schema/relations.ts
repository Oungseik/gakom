import { defineRelations } from "drizzle-orm";
import { image } from "./image";
import { account, member, organization, session, twoFactor, user, verification } from "./index";

export const relations = defineRelations(
  {
    user,
    session,
    account,
    verification,
    organization,
    member,
    twoFactor,
    image,
  },
  (r) => ({
    user: {
      sessions: r.many.session(),
      accounts: r.many.account(),
      members: r.many.member(),
      twoFactors: r.many.twoFactor(),
      images: r.many.image(),
    },
    session: {
      user: r.one.user({ from: r.session.userId, to: r.user.id }),
    },
    account: {
      user: r.one.user({ from: r.account.userId, to: r.user.id }),
    },
    organization: {
      members: r.many.member(),
    },
    member: {
      organization: r.one.organization({ from: r.member.organizationId, to: r.organization.id }),
      user: r.one.user({ from: r.member.userId, to: r.user.id, optional: false }),
    },
    twoFactor: {
      user: r.one.user({ from: r.twoFactor.userId, to: r.user.id }),
    },
    image: {
      user: r.one.user({ from: r.image.uploaderId, to: r.user.id }),
    },
    verification: {},
  }),
);
