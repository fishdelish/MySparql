class AddXsltType < ActiveRecord::Migration
  def self.up
    add_column :queries, :xslt_type, :string
  end

  def self.down
    remove_column :queries, :xslt_type
  end
end
