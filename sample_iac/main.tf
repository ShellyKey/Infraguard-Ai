resource "aws_s3_bucket" "infraguard_demo" {
  bucket = "infraguard-demo-bucket"
}

resource "aws_s3_bucket_public_access_block" "infraguard_demo" {
  bucket = aws_s3_bucket.infraguard_demo.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}