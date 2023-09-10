import type {
  FullDatabaseUser,
  FullGroup,
  FullRole,
  FullUser,
  Permission,
} from '$lib/db/types';

export const getDirectRoles = (dbUser: FullDatabaseUser): FullRole[] => {
  return (dbUser.usersToRoles ?? []).map(r => ({
    id: r.roleId,
    name: r.role.name,
    description: r.role.description,
    permissions: (r.role.permissionsToRoles ?? []).map(p => p.permission),
  }));
};

export const getDirectPermissions = (dbUser: FullDatabaseUser): Permission[] => {
  return (dbUser.usersToPermissions ?? []).map(p => p.permission);
};

export const getGroups = (dbUser: FullDatabaseUser): FullGroup[] => {
  return (dbUser.usersToGroups ?? []).map(g => ({
    id: g.group.id,
    name: g.group.name,
    description: g.group.description,
    permissions: (g.group.groupsToPermissions ?? []).map(p => p.permission),
    roles: (g.group.groupsToRoles ?? []).map(r => ({
      id: r.roleId,
      name: r.role.name,
      description: r.role.description,
      permissions: (r.role.permissionsToRoles ?? []).map(p => p.permission),
    })),
  }));
};

export const getAllPermissions = (dbUser: FullDatabaseUser): Permission[] => {
  const directPerms = getDirectPermissions(dbUser);

  let groupPerms: Permission[] = [];
  let rolePerms: Permission[] = [];

  (dbUser.usersToGroups ?? []).forEach(g => {
    const directGroupPerms = (g.group.groupsToPermissions ?? []).map(p => p.permission);

    (g.group.groupsToRoles ?? []).map(r => (r.role.permissionsToRoles ?? [])
      .map(p => p.permission)).forEach(p => { groupPerms = groupPerms.concat(p); });

    groupPerms = groupPerms.concat(directGroupPerms);
  });

  (dbUser.usersToRoles ?? []).forEach(r => {
    rolePerms = rolePerms.concat((r.role.permissionsToRoles ?? []).map(p => p.permission));
  });

  const arr = directPerms.concat(groupPerms, rolePerms);

  return [...new Map(arr.map(v => [v.id, v])).values()];
};

export const getAllRoles = (dbUser: FullDatabaseUser): FullRole[] => {
  const directRoles = getDirectRoles(dbUser);

  let groupRoles: FullRole[] = [];

  (dbUser.usersToGroups ?? []).forEach(g => {
    const directGroupRoles = (g.group.groupsToRoles ?? []).map(r => ({
      id: r.roleId,
      name: r.role.name,
      description: r.role.description,
      permissions: (r.role.permissionsToRoles ?? []).map(p => p.permission),
    }));

    groupRoles = groupRoles.concat(directGroupRoles);
  });

  const arr = directRoles.concat(groupRoles);

  return [...new Map(arr.map(v => [v.id, v])).values()];
};

export const transformUser = (dbUser: FullDatabaseUser): FullUser => {
  return {
    id: dbUser.id,
    email: dbUser.email,
    verified: dbUser.verified,
    config: dbUser.config,
    allPermissions: getAllPermissions(dbUser),
    allRoles: getAllRoles(dbUser),
    directPermissions: getDirectPermissions(dbUser),
    directRoles: getDirectRoles(dbUser),
    groups: getGroups(dbUser),
  };
};
