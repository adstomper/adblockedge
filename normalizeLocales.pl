#!/usr/bin/perl

# This Source Code is subject to the terms of the Mozilla Public License
# version 2.0 (the "License"). You can obtain a copy of the License at
# http://mozilla.org/MPL/2.0/.

# This script will adjust the locales as received from Babelzilla - normalize
# newlines and remove comments that have been pointlessly copied over from
# en-US.
 
use strict;
use warnings;

$0 =~ s/(.*[\\\/])//g;
chdir($1) if $1;

opendir(local* LOCALES, "chrome/locale") or die "Failed to open directory chrome/locale";
foreach my $locale (readdir(LOCALES))
{
  next if $locale =~ /^\./ || $locale eq "en-US" || $locale eq "de" || $locale eq "ru";

  foreach my $file (<chrome/locale/$locale/*.properties>)
  {
    my $data = readFile($file);
    $data =~ s/\r//g;                   # Normalize newlines
    $data =~ s/\n+/\n/g;                # Remove empty lines
    $data =~ s/\\+?(\\n|'|")/$1/g;      # Remove double escapes
    $data =~ s/^\s*#.*\n*//gm;          # Remove pointless comments
    writeFile($file, $data);

    unlink($file) if -z $file;
  }

  foreach my $file (<chrome/locale/$locale/*.dtd>)
  {
    my $data = readFile($file);
    $data =~ s/\r//g;                         # Normalize newlines
    $data =~ s/\\n/\n/g;                      # Replace misencoded newlines by regular ones
    $data =~ s/\\(\n|'|"|&)/$1/g;             # Remove wrong escapes
    $data =~ s/\n+/\n/g;                      # Remove empty lines
    $data =~ s/[^\S\n]*<!--.*?-->\s*?\n*//gs; # Remove pointless comments
    writeFile($file, $data);

    unlink($file) if -z $file;
  }
}
closedir(LOCALES);

sub readFile
{
  my $file = shift;

  open(local *FILE, "<", $file) || die "Could not read file '$file'";
  binmode(FILE);
  local $/;
  my $result = <FILE>;
  close(FILE);

  return $result;
}

sub writeFile
{
  my ($file, $contents) = @_;

  open(local *FILE, ">", $file) || die "Could not write file '$file'";
  binmode(FILE);
  print FILE $contents;
  close(FILE);
}
