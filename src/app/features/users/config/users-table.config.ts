import { PaginationMeta } from '../../../core/api/pagination.model';
import { DataTableConfig, TableBadgeTone } from '../../../shared/table/table.types';
import { AdminUser, AdminUsersQuery, UserStatus, UserType } from '../data-access/users.models';

const USER_TYPE_LABEL: Record<UserType, string> = {
  passenger: 'Pasajero',
  driver: 'Conductor',
  admin: 'Administrador',
};

const USER_STATUS_LABEL: Record<UserStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  banned: 'Bloqueado',
};

function getStatusTone(status: UserStatus): TableBadgeTone {
  if (status === 'active') {
    return 'success';
  }

  if (status === 'inactive') {
    return 'warning';
  }

  return 'danger';
}

export function buildUsersTableConfig(
  query: AdminUsersQuery,
  pagination: PaginationMeta,
  deletingUserId: string | null,
): DataTableConfig<AdminUser> {
  const hasActiveCriteria = Boolean(query.search?.trim() || query.userType || query.status);

  return {
    columns: [
      {
        key: 'avatar',
        label: '',
        type: 'avatar',
        value: (user) => user.profilePictureUrl,
        fallbackText: (user) => user.name,
        imageAlt: (user) => `Avatar de ${user.name}`,
      },
      {
        key: 'name',
        label: 'Nombre',
        value: (user) => user.name,
      },
      // {
      //   key: 'email',
      //   label: 'Correo',
      //   value: (user) => user.email,
      // },
      {
        key: 'phoneNumber',
        label: 'Teléfono',
        value: (user) => user.phoneNumber,
      },
      {
        key: 'userType',
        label: 'Tipo',
        type: 'badge',
        value: (user) => user.userType,
        badge: {
          label: (value) => USER_TYPE_LABEL[value as UserType] ?? '—',
          tone: () => 'info',
        },
      },
      {
        key: 'status',
        label: 'Estado',
        type: 'badge',
        value: (user) => user.status,
        badge: {
          label: (value) => USER_STATUS_LABEL[value as UserStatus] ?? '—',
          tone: (value) => getStatusTone(value as UserStatus),
        },
      },
      // {
      //   key: 'emailVerified',
      //   label: 'Email verificado',
      //   type: 'boolean',
      //   align: 'center',
      //   value: (user) => user.emailVerified,
      // },
      // {
      //   key: 'phoneNumberVerified',
      //   label: 'Teléfono verificado',
      //   type: 'boolean',
      //   align: 'center',
      //   value: (user) => user.phoneNumberVerified,
      // },
      {
        key: 'createdAt',
        label: 'Creado',
        type: 'date',
        value: (user) => user.createdAt,
        dateFormat: 'dd/MM/yyyy',
      },
    ],

    actions: [
      {
        key: 'detail',
        label: 'Ver detalle',
        icon: 'visibility',
        color: 'neutral',
      },
      {
        key: 'edit',
        label: 'Editar',
        icon: 'edit',
        color: 'primary',
        visible: (user) => user.userType !== 'admin',
      },
      {
        key: 'delete',
        label: 'Eliminar',
        icon: 'delete',
        color: 'danger',
        visible: (user) => user.userType !== 'admin',
        disabled: (user) => deletingUserId === user.id,
      },
    ],

    trackBy: (user) => user.id,

    toolbar: {
      search: {
        value: query.search ?? '',
        placeholder: 'Buscar por nombre o teléfono...',
        ariaLabel: 'Buscar usuarios por nombre o teléfono',
        clearAriaLabel: 'Limpiar búsqueda de usuarios',
      },
      filters: [
        {
          key: 'userType',
          label: 'Tipo de usuario',
          placeholder: 'Todos',
          value: query.userType ?? null,
          options: [
            {
              label: 'Todos',
              value: null,
            },
            {
              label: 'Administrador',
              value: 'admin',
            },
            {
              label: 'Pasajero',
              value: 'passenger',
            },
            {
              label: 'Conductor',
              value: 'driver',
            },
          ],
        },
        {
          key: 'status',
          label: 'Estado',
          placeholder: 'Todos',
          value: query.status ?? null,
          options: [
            {
              label: 'Todos',
              value: null,
            },
            {
              label: 'Activo',
              value: 'active',
            },
            {
              label: 'Inactivo',
              value: 'inactive',
            },
            {
              label: 'Bloqueado',
              value: 'banned',
            },
          ],
        },
      ],
    },

    pagination: {
      length: pagination.total,
      pageIndex: Math.max(0, pagination.page - 1),
      pageSize: pagination.limit,
      pageSizeOptions: [10, 25, 50],
      showFirstLastButtons: true,
    },

    emptyTitle: hasActiveCriteria ? 'No hay usuarios que coincidan' : 'No hay usuarios registrados',

    emptyDescription: hasActiveCriteria
      ? 'Ajusta la búsqueda o los filtros para volver a ver resultados.'
      : 'Crea el primer usuario desde el panel administrativo.',

    emptyActionLabel: hasActiveCriteria ? undefined : 'Crear usuario',

    loadingRows: 6,
  };
}
