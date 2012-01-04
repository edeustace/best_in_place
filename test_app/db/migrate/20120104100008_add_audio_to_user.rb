class AddAudioToUser < ActiveRecord::Migration
  def self.up
    change_table :users do |t|
      t.string :audio_file_name
      t.string :audio_content_type
      t.integer :audio_file_size
      t.datetime :audio_updated_at
    end
  end

  def self.down
    change_table :users do |t|
      t.remove :audio_file_name, :audio_content_type, :audio_file_size, :audio_updated_at
    end
  end
end
