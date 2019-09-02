import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image, FlatList, Dimensions, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import cc from 'cryptocompare';
import {LineChart} from 'react-native-chart-kit';
import availableCoins from './availableCoins';
const screenWidth = Dimensions.get('window').width

export default class App extends React.Component{
	constructor(){
		super();
		this.state={
			coinList : [],
			selected : "",
			loadingChart : false,
			data : {
				labels: ['9', '8', '7', '6', '5', '4', '3', '2', '1', 'Now'],
				datasets: [{
					data: [ 0,0,0,0,0,0,0,0,0,0 ],
				}],
			},
			chartConfig : {
				backgroundGradientFrom: '#FFF',
				backgroundGradientTo: '#17c8e3',
				color: () => `#0a2c91`,
				strokeWidth: 2,
			}
		}
	}

	getCoinList = async() => {
		let coinList = await cc.coinList();
		const final = [];
		Object.keys(coinList.Data).forEach(coin => {
			if(availableCoins.includes(coinList.Data[coin].Name)){
				final.push({ key : coinList.Data[coin].Id, image : `https://cryptocompare.com/${coinList.Data[coin].ImageUrl}`, name : coinList.Data[coin].Name})
			}
		});
		this.setState({ coinList : final});
	}

	selectCoin = coin => {
		if(coin !== this.state.selected){
			this.setState({selected : coin, loadingChart : true})
			cc.histoHour(coin, 'USD', options = {limit : 10}).then(priceData => {
				const final = priceData.map(prices => prices.open)
				this.setState({ data : {...this.state.data, datasets : [{ data : final }]}, loadingChart : false})
			})
			.catch(err => this.setState({ loadingChart : false}))
		}
	}

	componentDidMount(){
		this.getCoinList();
	}

	render(){
		return(
			<View style={styles.container}>
				<Text>{this.state.selected.length ? `Price history in last 10 hours of ${this.state.selected}` : "Please Select a coin"}</Text>
				{this.state.loadingChart 
					? 
					<View style={{width : screenWidth - 16, height : 220, backgroundColor : "blue", justifyContent : "center"}}>
						<ActivityIndicator size="large" color="#17c8e3"/>
					</View> 
					: 
					<LineChart 
						yAxisLabel={'$'} 
						data={this.state.data} 
						width={screenWidth} 
						height={220} 
						chartConfig={this.state.chartConfig} 
					/>
				}
				<ScrollView>
					{this.state.coinList.length 
					? <FlatList 
						numColumns={3} 
						data={this.state.coinList} 
						extraData={this.state.selected}
						renderItem={({item}) => 
							<TouchableOpacity 
								style={this.state.selected === item.name ? styles.selected : styles.tile} 
								onPress={() => this.selectCoin(item.name)}
								disabled={item.sponsored}
								key={item.name}
							>
								<Image 
									style={{width: 50, height: 50}} 
									source={{uri : item.image}}
									defaultSource={require('./assets/defaultIcon.png')}
								/>
								<Text>{item.name}</Text>
							</TouchableOpacity>
							} 
						/> 
					: <Text>Loading Coins...</Text> 
					}
				</ScrollView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop : 20,
	},
	tile : {
		width : "30%", 
		height:100, 
		alignItems : "center", 
		justifyContent : "center",
		margin : "1.5%",
		borderWidth : 0.5,
		borderRadius : 50,
		borderColor : "black"
	},
	selected : {
		width : "30%", 
		height:100, 
		alignItems : "center", 
		justifyContent : "center",
		margin : "1.5%",
		borderWidth : 3,
		borderRadius : 50,
		borderColor : "blue"
	}
});
