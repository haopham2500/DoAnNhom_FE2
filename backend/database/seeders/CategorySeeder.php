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
            ['type' => 'income', 'name' => 'Lương', 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'income', 'name' => 'Thưởng', 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'income', 'name' => 'Kinh doanh', 'created_at' => now(), 'updated_at' => now()],
            // Expense
            ['type' => 'expense', 'name' => 'Ăn uống', 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'expense', 'name' => 'Di chuyển', 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'expense', 'name' => 'Mua sắm', 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'expense', 'name' => 'Hóa đơn', 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'expense', 'name' => 'Giải trí', 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'expense', 'name' => 'Sức khỏe', 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'expense', 'name' => 'Giáo dục', 'created_at' => now(), 'updated_at' => now()],
        ];

        \Illuminate\Support\Facades\DB::table('categories')->insert($categories);
    }
}
