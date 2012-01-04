class User < ActiveRecord::Base

  has_attached_file :avatar, :styles => { :medium => "300x300>", :thumb => "100x100>" }
  has_attached_file :audio

  validates :name,
    :length => { :minimum => 2, :maximum => 24, :message => "has invalid length"},
    :presence => {:message => "can't be blank"}
  validates :last_name,
    :length => { :minimum => 2, :maximum => 24, :message => "has invalid length"},
    :presence => {:message => "can't be blank"}
  validates :address,
    :length => { :minimum => 5, :message => "too short length"},
    :presence => {:message => "can't be blank"}
  validates :email,
    :presence => {:message => "can't be blank"},
    :format => {:with => /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i, :message => "has wrong email format"}
  validates :zip, :numericality => true, :length => { :minimum => 5 }

  def address_format
    "<b>addr => [#{address}]</b>".html_safe
  end

  def markdown_desc
    RDiscount.new(description).to_html.html_safe
  end
  
  def avatar_thumb
    avatar.url(:thumb)
  end

  def audio_url
    audio.url
  end
end
