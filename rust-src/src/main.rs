use structopt::StructOpt;
use git2::{Repository};

/// Search for a pattern in a file and display the lines that contain it.
#[derive(StructOpt)]
struct Cli {
    branch: String,
}

fn main() {
    let args = Cli::from_args();
    println!("{}", args.branch);

    let repo = Repository::open(".".to_string());
    let head = match repo.head().unwrap();
    println!("Cur branch = {}", head.unwrap_or("Failed to find branch"));
}
