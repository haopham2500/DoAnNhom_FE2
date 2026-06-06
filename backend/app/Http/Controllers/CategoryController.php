<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(Category::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:income,expense',
            'name' => 'required|string|max:255',
            'color' => 'nullable|string',
        ]);

        $category = Category::create($request->all());

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'create_category',
            'details' => "Tạo danh mục mới: {$category->name} ({$category->type})"
        ]);

        return response()->json($category, 201);
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'type' => 'required|in:income,expense',
            'name' => 'required|string|max:255',
            'color' => 'nullable|string',
        ]);

        $category->update($request->all());

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_category',
            'details' => "Cập nhật danh mục: {$category->name}"
        ]);

        return response()->json($category);
    }

    public function destroy(Request $request, Category $category)
    {
        $catName = $category->name;
        $category->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'delete_category',
            'details' => "Xóa danh mục: {$catName}"
        ]);

        return response()->json(['message' => 'Xóa danh mục thành công']);
    }
}
