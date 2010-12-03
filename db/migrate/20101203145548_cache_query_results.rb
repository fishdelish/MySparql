class CacheQueryResults < ActiveRecord::Migration
  def self.up
    add_column :queries, :cache_json, :text
    add_column :queries, :cache_xml, :text
  end

  def self.down
    drop_column :queries, :cache_json
    drop_column :queries, :cache_xml
  end
end
