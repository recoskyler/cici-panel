import type {
  FullDatabaseGroup,
  FullDatabaseRole,
  FullDatabaseUser,
  FullGroup,
  FullRole,
  FullUser,
  Permission,
  SafeDatabaseGroup,
  SafeDatabaseRole,
  SafeDatabaseUser,
  SafeGroup,
  SafeRole,
  SafeUser,
} from '$lib/db/types';

export const getDirectFullRoles = (dbUser: FullDatabaseUser): FullRole[] => {
  return (dbUser.usersToRoles ?? []).filter(e => !e.role.deleted).map(r => ({
    id: r.roleId,
    name: r.role.name,
    description: r.role.description,
    permissions: (r.role.permissionsToRoles ?? []).map(p => p.permission),
    deleted: r.role.deleted,
    protected: r.role.protected,
    users: [],
    groups: [],
  }));
};

export const getDirectSafeRoles = (dbUser: SafeDatabaseUser | FullDatabaseUser): SafeRole[] => {
  return (dbUser.usersToRoles ?? []).filter(e => !e.role.deleted).map(r => ({
    id: r.roleId,
    name: r.role.name,
    description: r.role.description,
    deleted: r.role.deleted,
    protected: r.role.protected,
    users: [],
    groups: [],
  }));
};

export const getDirectPermissions = (dbUser: FullDatabaseUser): Permission[] => {
  return (dbUser.usersToPermissions ?? []).map(p => p.permission);
};

export const getFullGroups = (dbUser: FullDatabaseUser): FullGroup[] => {
  return (dbUser.usersToGroups ?? []).filter(e => !e.group.deleted).map(g => ({
    id: g.group.id,
    name: g.group.name,
    deleted: g.group.deleted,
    description: g.group.description,
    users: [],
    permissions: (g.group.groupsToPermissions ?? []).map(p => p.permission),
    roles: (g.group.groupsToRoles ?? []).map(r => ({
      id: r.roleId,
      name: r.role.name,
      description: r.role.description,
      permissions: (r.role.permissionsToRoles ?? []).map(p => p.permission),
      deleted: r.role.deleted,
      protected: r.role.protected,
      users: [],
      groups: [],
    })),
  }));
};

export const getSafeGroups = (dbUser: FullDatabaseUser | SafeDatabaseUser): SafeGroup[] => {
  return (dbUser.usersToGroups ?? []).filter(e => !e.group.deleted).map(g => ({
    id: g.group.id,
    name: g.group.name,
    description: g.group.description,
    deleted: g.group.deleted,
    users: [],
    roles: (g.group.groupsToRoles ?? []).map(r => ({
      id: r.roleId,
      name: r.role.name,
      description: r.role.description,
      deleted: r.role.deleted,
      protected: r.role.protected,
    })),
  }));
};

export const getAllPermissions = (dbUser: FullDatabaseUser): Permission[] => {
  const directPerms = getDirectPermissions(dbUser);

  let groupPerms: Permission[] = [];
  let rolePerms: Permission[] = [];

  (dbUser.usersToGroups ?? []).filter(e => !e.group.deleted).forEach(g => {
    const directGroupPerms = (g.group.groupsToPermissions ?? []).map(p => p.permission);

    (g.group.groupsToRoles ?? []).filter(e => !e.role.deleted)
      .map(r => (r.role.permissionsToRoles ?? [])
        .map(p => p.permission)).forEach(p => { groupPerms = groupPerms.concat(p); });

    groupPerms = groupPerms.concat(directGroupPerms);
  });

  (dbUser.usersToRoles ?? []).filter(e => !e.role.deleted).forEach(r => {
    rolePerms = rolePerms.concat((r.role.permissionsToRoles ?? []).map(p => p.permission));
  });

  const arr = directPerms.concat(groupPerms, rolePerms);

  return [...new Map(arr.map(v => [v.name, v])).values()];
};

export const getAllFullRoles = (dbUser: FullDatabaseUser): FullRole[] => {
  const directRoles = getDirectFullRoles(dbUser);

  let groupRoles: FullRole[] = [];

  (dbUser.usersToGroups ?? []).filter(e => !e.group.deleted).forEach(g => {
    const directGroupRoles = (g.group.groupsToRoles ?? []).filter(e => !e.role.deleted)
      .map(r => ({
        id: r.roleId,
        name: r.role.name,
        description: r.role.description,
        permissions: (r.role.permissionsToRoles ?? []).map(p => p.permission),
        deleted: r.role.deleted,
        protected: r.role.protected,
        users: [],
        groups: [],
      }));

    groupRoles = groupRoles.concat(directGroupRoles);
  });

  const arr = directRoles.concat(groupRoles);

  return [...new Map(arr.map(v => [v.id, v])).values()];
};

export const getAllSafeRoles = (dbUser: FullDatabaseUser | SafeDatabaseUser): SafeRole[] => {
  const directRoles = getDirectSafeRoles(dbUser);

  let groupRoles: SafeRole[] = [];

  (dbUser.usersToGroups ?? []).filter(e => !e.group.deleted).forEach(g => {
    const directGroupRoles = (g.group.groupsToRoles ?? []).filter(e => !e.role.deleted)
      .map(r => ({
        id: r.roleId,
        name: r.role.name,
        description: r.role.description,
        deleted: r.role.deleted,
        protected: r.role.protected,
        users: [],
        groups: [],
      }));

    groupRoles = groupRoles.concat(directGroupRoles);
  });

  const arr = directRoles.concat(groupRoles);

  return [...new Map(arr.map(v => [v.id, v])).values()];
};

export const toFullUser = (dbUser: FullDatabaseUser): FullUser => {
  return {
    id: dbUser.id,
    email: dbUser.email,
    deleted: dbUser.deleted,
    verified: dbUser.verified,
    config: dbUser.config,
    allPermissions: getAllPermissions(dbUser),
    allRoles: getAllFullRoles(dbUser),
    directPermissions: getDirectPermissions(dbUser),
    directRoles: getDirectFullRoles(dbUser),
    groups: getFullGroups(dbUser),
    root: dbUser.root,
  };
};

export const toSafeUser = (dbUser: FullDatabaseUser | SafeDatabaseUser): SafeUser => ({
  id: dbUser.id,
  email: dbUser.email,
  deleted: dbUser.deleted,
  verified: dbUser.verified,
  config: dbUser.config,
  allRoles: getAllSafeRoles(dbUser),
  directRoles: getDirectSafeRoles(dbUser),
  groups: getSafeGroups(dbUser),
  root: dbUser.root,
});

export const toSafeGroup = (dbGroup: FullDatabaseGroup | SafeDatabaseGroup): SafeGroup => ({
  id: dbGroup.id,
  deleted: dbGroup.deleted,
  name: dbGroup.name,
  description: dbGroup.description,
  roles: dbGroup.groupsToRoles.filter(e => !e.role.deleted).map(r => ({
    id: r.roleId,
    deleted: r.role.deleted,
    name: r.role.name,
    description: r.role.description,
    protected: r.role.protected,
  })),
  users: dbGroup.usersToGroups.filter(e => !e.user.deleted).map(u => ({
    id: u.userId,
    config: u.user.config,
    deleted: u.user.deleted,
    email: u.user.email,
    verified: u.user.verified,
    root: u.user.root,
  })),
});

export const toFullGroup = (dbGroup: FullDatabaseGroup): FullGroup => ({
  id: dbGroup.id,
  deleted: dbGroup.deleted,
  name: dbGroup.name,
  description: dbGroup.description,
  permissions: (dbGroup.groupsToPermissions ?? []).map(p => p.permission),
  roles: (dbGroup.groupsToRoles ?? []).filter(e => !e.role.deleted).map(r => ({
    id: r.roleId,
    name: r.role.name,
    description: r.role.description,
    permissions: (r.role.permissionsToRoles ?? []).map(p => p.permission),
    deleted: r.role.deleted,
    protected: r.role.protected,
    users: [],
    groups: [],
  })),
  users: dbGroup.usersToGroups.filter(e => !e.user.deleted).map(u => ({
    id: u.userId,
    config: u.user.config,
    deleted: u.user.deleted,
    email: u.user.email,
    verified: u.user.verified,
    root: u.user.root,
  })),
});

export const toFullRole = (dbRole: FullDatabaseRole): FullRole => ({
  id: dbRole.id,
  name: dbRole.name,
  description: dbRole.description,
  deleted: dbRole.deleted,
  protected: dbRole.protected,
  permissions: (dbRole.permissionsToRoles ?? []).map(p => p.permission),
  users: dbRole.usersToRoles.filter(e => !e.user.deleted).map(u => ({
    id: u.userId,
    config: u.user.config,
    deleted: u.user.deleted,
    email: u.user.email,
    verified: u.user.verified,
    root: u.user.root,
  })),
  groups: dbRole.groupsToRoles.filter(e => !e.group.deleted).map(g => ({
    id: g.group.id,
    name: g.group.name,
    deleted: g.group.deleted,
    description: g.group.description,
    users: [],
    permissions: [],
    roles: [],
  })),
});

export const toSafeRole = (dbRole: SafeDatabaseRole | FullDatabaseRole): SafeRole => ({
  id: dbRole.id,
  name: dbRole.name,
  description: dbRole.description,
  deleted: dbRole.deleted,
  protected: dbRole.protected,
  users: dbRole.usersToRoles.filter(e => !e.user.deleted).map(u => ({
    id: u.userId,
    config: u.user.config,
    deleted: u.user.deleted,
    email: u.user.email,
    verified: u.user.verified,
    root: u.user.root,
  })),
  groups: dbRole.groupsToRoles.filter(e => !e.group.deleted).map(g => ({
    id: g.group.id,
    name: g.group.name,
    deleted: g.group.deleted,
    description: g.group.description,
    users: [],
    permissions: [],
    roles: [],
  })),
});
