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

  // 渲染一个全屏居中的旋转 loading（Tailwind 的 animate-spin）
  return (
    <div
      className="grid h-dvh w-full place-items-center bg-transparent"
      role="status"
      aria-live="polite"
      aria-label="加载中"
    >
      <svg
        className="size-10 animate-spin motion-reduce:animate-none [transform-box:fill-box] [transform-origin:center]"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <g transform="translate(2.5 2.5)">
          <path
            d="M9.5 2.9375V5.5625M9.5 13.4375V16.0625M2.9375 9.5H5.5625M13.4375 9.5H16.0625"
            stroke="currentColor"
            strokeWidth="1.875"
            strokeLinecap="round"
          />
          <path
            d="M4.86011 4.85961L6.71627 6.71577M12.2847 12.2842L14.1409 14.1404M4.86011 14.1404L6.71627 12.2842M12.2847 6.71577L14.1409 4.85961"
            stroke="currentColor"
            strokeWidth="1.875"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <span className="sr-only">加载中</span>
    </div>
  );
};

export default LoginSilentPage;
