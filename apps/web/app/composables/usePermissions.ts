export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = computed(() => {
    if (!user.value?.roles) return new Set<string>();

    const perms = new Set<string>();
    for (const role of user.value.roles) {
      if (role.permissions) {
        for (const perm of role.permissions) {
          perms.add(perm.name);
        }
      }
    }
    return perms;
  });

  const roles = computed(() => {
    if (!user.value?.roles) return new Set<string>();
    return new Set(user.value.roles.map((r) => r.name));
  });

  const hasPermission = (permission: string) => {
    return permissions.value.has(permission);
  };

  const hasAnyPermission = (...perms: string[]) => {
    return perms.some((p) => permissions.value.has(p));
  };

  const hasAllPermissions = (...perms: string[]) => {
    return perms.every((p) => permissions.value.has(p));
  };

  const hasRole = (role: string) => {
    return roles.value.has(role);
  };

  const hasAnyRole = (...roleNames: string[]) => {
    return roleNames.some((r) => roles.value.has(r));
  };

  const isAdmin = computed(() => {
    return hasAnyRole('SUPER_ADMIN', 'ADMIN');
  });

  const isSuperAdmin = computed(() => {
    return hasRole('SUPER_ADMIN');
  });

  return {
    permissions,
    roles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isAdmin,
    isSuperAdmin,
  };
};
