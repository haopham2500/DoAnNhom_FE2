<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckIfLocked
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->is_locked) {
            return response()->json([
                'message' => 'Tài khoản của bạn đã bị khóa, vui lòng liên hệ nhân viên CSKH'
            ], 403);
        }
        return $next($request);
    }
}
