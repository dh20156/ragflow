// pages/login/index.ts
import { useEffect } from 'react';
import { useNavigate } from 'umi';

import authorizationUtil, {
  getAuthorization,
  redirectToLogin,
} from '@/utils/authorization-util';
import { useLogin } from '@/hooks/login-hooks';

/**
 * 无 UI 静默登录页：
 * - 先检查 Authorization / Token 是否存在
 * - 若不存在，调用 useLogin() 发起登录（后端基于 Cookie 识别，无需账号密码）
 * - useLogin 内部会负责把 Authorization / Token / UserInfo 写入本地
 * - 成功后跳转 redirect 或首页；失败则跳转登录页
 */
const LoginSilentPage = () => {
  const navigate = useNavigate();
  const { login } = useLogin();

  useEffect(() => {
    const run = async () => {
      try {
        // 1) 判断是否已有登录态
        const authorization = getAuthorization(); // 可能来自 ?auth= 或 localStorage
        const token = authorizationUtil.getToken?.() as string | null;

        if (authorization && token) {
          const redirect =
            new URLSearchParams(window.location.search).get('redirect') || '/';
          navigate(redirect);
          return;
        }

        // 2) 未登录：调用 useLogin()（后端会从 Cookie 中识别并完成登录）
        const code = await login({
          email: '',     // 后端会忽略并从 Cookie 取真实账号
          password: '',  // 同上
        } as any);

        // 3) 根据结果跳转（useLogin 已完成本地落库）
        if (code === 0) {
          const redirect =
            new URLSearchParams(window.location.search).get('redirect') || '/';
          navigate(redirect);
          return;
        }

        // 登录失败：跳转到登录页
        redirectToLogin();
      } catch (err) {
        console.error('[Silent Login] error:', err);
        redirectToLogin();
      }
    };

    void run();
  }, [login, navigate]);

  // 无 UI：不渲染任何内容
  return null;
};

export default LoginSilentPage;
