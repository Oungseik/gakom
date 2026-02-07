import { defineRelations } from "drizzle-orm";
import { account, session, twoFactor, user } from "./auth";
import { image } from "./image";
import { member, organization } from "./organization";

export const relations = defineRelations(
  {
    account,
    user,
    session,
    twoFactor,

    image,

    member,
    organization,
  },
  (r) => ({
    account: {
      user: r.one.user({ from: r.account.userId, to: r.user.id }),
    },
    session: {
      user: r.one.user({ from: r.session.userId, to: r.user.id }),
    },
    twoFactor: {
      user: r.one.user({ from: r.twoFactor.userId, to: r.user.id }),
    },
    user: {
      sessions: r.many.session(),
      accounts: r.many.account(),
      twoFactors: r.many.twoFactor(),
      images: r.many.image(),
      members: r.many.member(),
    },

    image: {
      user: r.one.user({ from: r.image.uploaderId, to: r.user.id }),
    },

    member: {
      organization: r.one.organization({ from: r.member.organizationId, to: r.organization.id }),
      user: r.one.user({ from: r.member.userId, to: r.user.id }),
    },
    organization: {
      members: r.many.member(),
    },
  }),
);
