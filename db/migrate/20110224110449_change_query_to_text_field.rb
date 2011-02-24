class ChangeQueryToTextField < ActiveRecord::Migration
  def self.up
    change_column :queries, :query, :text
  end

  def self.down
    raise ActiveRecord::IrreversibleMigration.new
  end
end
