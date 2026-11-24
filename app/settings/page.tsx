export default function SettingsPage() {
  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card p-4 shadow-sm">
          <h3>Pengaturan Akun</h3>
          <form>
            <div className="mb-3">
              <label className="form-label">Nama Lengkap</label>
              <input type="text" className="form-control" defaultValue="Kyatmaja Lookman" />
            </div>
            <div className="mb-3">
              <label className="form-label">Bio</label>
              <textarea className="form-control" rows={2} defaultValue="Halo! Salam kenal guys." />
            </div>
            <button type="button" className="btn btn-success">Simpan Perubahan</button>
          </form>
        </div>
      </div>
    </div>
  );
}