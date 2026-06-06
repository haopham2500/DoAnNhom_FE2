<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Income
            ['type' => 'income', 'name' => 'Lương', 'icon' => 'FiDollarSign', 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'income', 'name' => 'Thưởng', 'icon' => 'FiGift', 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'income', 'name' => 'Kinh doanh', 'icon' => 'FiTrendingUp', 'created_at' => now(), 'updated_at' => now()],
            // Expense
            ['type' => 'expense', 'name' => 'Ăn uống', 'icon' => 'FiCoffee', 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'expense', 'name' => 'Di chuyển', 'icon' => 'FiNavigation', 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'expense', 'name' => 'Mua sắm', 'icon' => 'FiShoppingBag', 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'expense', 'name' => 'Hóa đơn', 'icon' => 'FiFileText', 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'expense', 'name' => 'Giải trí', 'icon' => 'FiFilm', 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'expense', 'name' => 'Sức khỏe', 'icon' => 'FiHeart', 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'expense', 'name' => 'Giáo dục', 'icon' => 'FiBookOpen', 'created_at' => now(), 'updated_at' => now()],
        ];

        \Illuminate\Support\Facades\DB::table('categories')->insert($categories);
    }
}
