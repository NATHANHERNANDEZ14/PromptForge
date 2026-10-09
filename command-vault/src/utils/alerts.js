import Swal from 'sweetalert2';

const swalDarkTheme = {
  background: '#161e2e',
  color: '#f8fafc',
  confirmButtonColor: '#3b82f6',
  cancelButtonColor: '#475569',
  customClass: {
    popup: 'glass-modal-swal',
    confirmButton: 'btn btn-primary',
    cancelButton: 'btn btn-ghost'
  }
};

export const showToast = (title, icon = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
    background: '#1e293b',
    color: '#f8fafc',
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  return Toast.fire({
    icon,
    title
  });
};

export const showSuccess = (title, text = '') => {
  return Swal.fire({
    ...swalDarkTheme,
    icon: 'success',
    title,
    text,
    confirmButtonText: 'Aceptar'
  });
};

export const showError = (title, text = '') => {
  return Swal.fire({
    ...swalDarkTheme,
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'Entendido'
  });
};

export const confirmDialog = async ({
  title = '¿Estás seguro?',
  text = 'Esta acción no se puede deshacer.',
  confirmButtonText = 'Sí, continuar',
  cancelButtonText = 'Cancelar',
  icon = 'warning'
} = {}) => {
  const result = await Swal.fire({
    ...swalDarkTheme,
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: icon === 'warning' || icon === 'danger' ? '#ef4444' : '#3b82f6',
    reverseButtons: true
  });

  return result.isConfirmed;
};
