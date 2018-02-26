#if defined(ILambdaSensorServiceExists)
#define FuelTrimService_SimpleExists
namespace EngineManagement
{
	class FuelTrimService_Narrow : public IFuelTrimService
	{
	public:
		FuelTrimService_Narrow(void *config);
		short GetFuelTrim(unsigned char cylinder);
	};
}
#endif