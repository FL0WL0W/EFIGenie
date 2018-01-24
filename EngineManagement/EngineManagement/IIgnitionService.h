namespace EngineManagement
{
	class IIgnitionService
	{
	public:
		virtual void CoilDwell() = 0;
		virtual void CoilFire() = 0;
	};
}