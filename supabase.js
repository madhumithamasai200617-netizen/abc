const supabase_Url = "https://pbzldaxhgnkhvcbzqbsm.supabase.co";
const supabase_Key = "sb_publishable_KCvBcFCoz-HvhYlSRgWxgg_r5dE_bsD";

const client = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

window.supabaseClient = client;
