import useAuthStore from '../store/authStore';

// VIEWER role can only perform GET requests — all write actions are restricted
const usePermission = () => {
  const user = useAuthStore((s) => s.user);
  const canWrite = user?.role !== 'VIEWER';
  return { canWrite };
};

export default usePermission;
