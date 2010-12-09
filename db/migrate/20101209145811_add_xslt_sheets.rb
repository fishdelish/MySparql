class AddXsltSheets < ActiveRecord::Migration
  def self.up
    add_column :queries, :xslt_sheet, :text
  end

  def self.down
    remove_column :queries, :xslt_sheet
  end
end
