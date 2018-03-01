#if defined(IFuelTrimServiceExists) && defined(ILambdaSensorServiceExists) && defined(IAfrServiceExists)
#define FuelTrimService_NarrowExists
namespace EngineManagement
{
	class FuelTrimService_Narrow : public IFuelTrimService
	{
	protected:
		//settings
		short _proportion;
		float _lambdaDeltaEnable;
		ILambdaSensorService *_lambdaSensorService;
		
		short _fuelTrim;
	public:
		FuelTrimService_Narrow(void *config);
		short GetFuelTrim(unsigned char cylinder);
		void TrimTick();
	};
}
#endif