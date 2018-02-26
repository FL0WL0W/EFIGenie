#define FuelTrimService_SimpleExists
namespace EngineManagement
{
	class FuelTrimService_Simple : public IFuelTrimService
	{
	public:
		FuelTrimService_Simple(void *config);
		short GetFuelTrim(unsigned char cylinder);
	};
}